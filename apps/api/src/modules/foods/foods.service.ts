import { SupabaseClient } from "@supabase/supabase-js";
import { FoodSearchResult, Food, AI_CONFIDENCE } from "@food-tracker/shared";
import {
  searchFoodsInDb,
  getFoodById,
  createManualFood,
  cacheFoodFromUsda,
  cacheAiFood,
} from "./foods.repository.js";
import { searchUsdaFoods } from "../../integrations/usdaFoodDataCentral/usda.service.js";
import { getAiService } from "../../integrations/gemini/gemini.service.js";
import { getAdminSupabaseClient } from "../../integrations/supabase/client.js";
import { CreateManualFood } from "./foods.schemas.js";

export async function searchFoods(
  userClient: SupabaseClient,
  userId: string,
  query: string,
  limit = 20
): Promise<FoodSearchResult[]> {
  // First pass: search locally
  const localResults = await searchFoodsInDb(userClient, userId, query, limit);

  if (localResults.length >= 5) {
    return localResults;
  }

  // Second pass: try USDA external API
  let usdaResults: Awaited<ReturnType<typeof searchUsdaFoods>> = [];
  try {
    usdaResults = await searchUsdaFoods(query, 5);
  } catch {
    // USDA API unavailable or key invalid — continue with local results only
  }
  const adminClient = getAdminSupabaseClient();

  for (const usdaFood of usdaResults) {
    if (!usdaFood.caloriesPer100g) continue;

    try {
      const cachedFood = await cacheFoodFromUsda(
        adminClient,
        usdaFood.fdcId,
        usdaFood.name,
        usdaFood.caloriesPer100g,
        usdaFood.proteinPer100g,
        usdaFood.carbsPer100g,
        usdaFood.fatPer100g,
        usdaFood.fiberPer100g,
        usdaFood
      );

      if (!localResults.find((r) => r.id === cachedFood.id)) {
        localResults.push({
          id: cachedFood.id,
          name: cachedFood.name,
          foodType: cachedFood.foodType,
          sourceType: cachedFood.sourceType,
          caloriesPer100g: cachedFood.caloriesPer100g,
          proteinPer100g: cachedFood.proteinPer100g,
          carbsPer100g: cachedFood.carbsPer100g,
          fatPer100g: cachedFood.fatPer100g,
          fiberPer100g: cachedFood.fiberPer100g,
          defaultServingName: cachedFood.defaultServingName,
          defaultServingWeightG: cachedFood.defaultServingWeightG,
          isVerified: cachedFood.isVerified,
          requiresVariationWarning: cachedFood.requiresVariationWarning,
          imageUrl: cachedFood.imagePath,
          description: cachedFood.description,
        });
      }
    } catch {
      // Best effort caching, don't fail the search
    }
  }

  // Third pass: AI normalization if still insufficient and AI is enabled
  const aiService = getAiService();
  if (aiService && localResults.length < 3) {
    try {
      const normalized = await aiService.normalizeFoodName(query);
      if (
        normalized.confidence >= AI_CONFIDENCE.MEDIUM &&
        normalized.normalizedFoodName.toLowerCase() !== query.toLowerCase()
      ) {
        const aiSearchResults = await searchFoodsInDb(
          userClient,
          userId,
          normalized.normalizedFoodName,
          5
        );
        for (const result of aiSearchResults) {
          if (!localResults.find((r) => r.id === result.id)) {
            localResults.push(result);
          }
        }
      }
    } catch {
      // AI is optional, continue without it
    }
  }

  return localResults.slice(0, limit);
}

export async function getFood(
  client: SupabaseClient,
  foodId: string
): Promise<Food | null> {
  return getFoodById(client, foodId);
}

export async function createUserFood(
  client: SupabaseClient,
  userId: string,
  data: CreateManualFood
): Promise<Food> {
  return createManualFood(client, userId, data);
}

export async function getRecentFoods(
  client: SupabaseClient,
  userId: string,
  limit = 10
): Promise<FoodSearchResult[]> {
  const { data, error } = await client
    .from("food_logs")
    .select("food_id, food_name_snapshot, foods(*)")
    .eq("user_id", userId)
    .not("food_id", "is", null)
    .order("created_at", { ascending: false })
    .limit(limit * 2);

  if (error || !data) return [];

  const seen = new Set<string>();
  const results: FoodSearchResult[] = [];

  for (const row of data) {
    const food = row.foods as Record<string, unknown> | null;
    if (food && !seen.has(row.food_id as string)) {
      seen.add(row.food_id as string);
      results.push({
        id: food.id as string,
        name: food.name as string,
        foodType: food.food_type as FoodSearchResult["foodType"],
        sourceType: food.source_type as FoodSearchResult["sourceType"],
        caloriesPer100g: food.calories_per_100g as number | null,
        proteinPer100g: food.protein_per_100g as number | null,
        carbsPer100g: food.carbs_per_100g as number | null,
        fatPer100g: food.fat_per_100g as number | null,
        fiberPer100g: food.fiber_per_100g as number | null,
        defaultServingName: food.default_serving_name as string | null,
        defaultServingWeightG: food.default_serving_weight_g as number | null,
        isVerified: food.is_verified as boolean,
        requiresVariationWarning: food.requires_variation_warning as boolean,
        imageUrl: food.image_path as string | null,
        description: food.description as string | null,
      });

      if (results.length >= limit) break;
    }
  }

  return results;
}

// Estimate nutrition for any food using USDA first, then Gemini AI.
// Returns a FoodSearchResult with the food cached in the DB.
export async function estimateAndCacheFood(
  query: string
): Promise<FoodSearchResult> {
  const adminClient = getAdminSupabaseClient();

  // 1. Try USDA first
  try {
    const usdaResults = await searchUsdaFoods(query, 1);
    if (usdaResults.length > 0 && usdaResults[0].caloriesPer100g) {
      const u = usdaResults[0];
      const food = await cacheFoodFromUsda(
        adminClient,
        u.fdcId,
        u.name,
        u.caloriesPer100g,
        u.proteinPer100g,
        u.carbsPer100g,
        u.fatPer100g,
        u.fiberPer100g,
        u
      );
      return {
        id: food.id,
        name: food.name,
        foodType: food.foodType,
        sourceType: food.sourceType,
        caloriesPer100g: food.caloriesPer100g,
        proteinPer100g: food.proteinPer100g,
        carbsPer100g: food.carbsPer100g,
        fatPer100g: food.fatPer100g,
        fiberPer100g: food.fiberPer100g,
        defaultServingName: food.defaultServingName,
        defaultServingWeightG: food.defaultServingWeightG,
        isVerified: food.isVerified,
        requiresVariationWarning: food.requiresVariationWarning,
        imageUrl: food.imagePath,
        description: food.description,
      };
    }
  } catch {
    // USDA unavailable, fall through to AI
  }

  // 2. Try Gemini AI estimation
  const aiService = getAiService();
  if (!aiService) {
    throw new Error("No AI service configured. Please add GEMINI_API_KEY and set ENABLE_AI_FOOD_MATCHING=true");
  }

  const estimate = await aiService.estimateFoodNutrition(query);
  const food = await cacheAiFood(adminClient, query, estimate);

  return {
    id: food.id,
    name: food.name,
    foodType: food.foodType,
    sourceType: food.sourceType,
    caloriesPer100g: food.caloriesPer100g,
    proteinPer100g: food.proteinPer100g,
    carbsPer100g: food.carbsPer100g,
    fatPer100g: food.fatPer100g,
    fiberPer100g: food.fiberPer100g,
    defaultServingName: food.defaultServingName,
    defaultServingWeightG: food.defaultServingWeightG,
    isVerified: food.isVerified,
    requiresVariationWarning: food.requiresVariationWarning,
    imageUrl: food.imagePath,
    description: food.description,
  };
}
