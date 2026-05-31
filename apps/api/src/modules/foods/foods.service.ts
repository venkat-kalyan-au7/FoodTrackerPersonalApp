import { SupabaseClient } from "@supabase/supabase-js";
import { FoodSearchResult, Food, AI_CONFIDENCE } from "@food-tracker/shared";
import {
  searchFoodsInDb,
  getFoodById,
  createManualFood,
  cacheFoodFromOFF,
  cacheAiFood,
} from "./foods.repository.js";
import { searchOpenFoodFacts } from "../../integrations/openFoodFacts/off.service.js";
import { getAiService, GeminiAiFoodMatchingService } from "../../integrations/gemini/gemini.service.js";
import { config } from "../../config/index.js";
import { createError } from "../../middleware/error.middleware.js";
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

  const adminClient = getAdminSupabaseClient();

  // Second pass: Open Food Facts (Indian + global packaged foods, no API key)
  try {
    const offResults = await searchOpenFoodFacts(query, 5);
    for (const off of offResults) {
      if (!off.caloriesPer100g) continue;
      try {
        const cached = await cacheFoodFromOFF(
          adminClient,
          off.offId,
          off.name,
          off.caloriesPer100g,
          off.proteinPer100g,
          off.carbsPer100g,
          off.fatPer100g,
          off.fiberPer100g,
          off.servingSizeG
        );
        if (!localResults.find((r) => r.id === cached.id)) {
          localResults.push({
            id: cached.id,
            name: cached.name,
            foodType: cached.foodType,
            sourceType: cached.sourceType,
            caloriesPer100g: cached.caloriesPer100g,
            proteinPer100g: cached.proteinPer100g,
            carbsPer100g: cached.carbsPer100g,
            fatPer100g: cached.fatPer100g,
            fiberPer100g: cached.fiberPer100g,
            defaultServingName: cached.defaultServingName,
            defaultServingWeightG: cached.defaultServingWeightG,
            isVerified: cached.isVerified,
            requiresVariationWarning: cached.requiresVariationWarning,
            imageUrl: cached.imagePath,
            description: cached.description,
          });
        }
      } catch {
        // best-effort cache
      }
    }
  } catch {
    // OFF unavailable, continue
  }

  // Third pass: AI normalization if still insufficient
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
    const food = (row.foods as unknown) as Record<string, unknown> | null;
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

  // 1. Try Gemini AI first — most accurate for Indian foods
  // Use key directly so this always works when GEMINI_API_KEY is set,
  // regardless of the ENABLE_AI_FOOD_MATCHING feature flag.
  const aiService = config.ai.geminiApiKey
    ? new GeminiAiFoodMatchingService()
    : getAiService();

  let aiErrorMessage: string | null = null;

  if (aiService) {
    try {
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
    } catch (aiErr) {
      // Capture the real AI error so we can surface it
      aiErrorMessage = aiErr instanceof Error ? aiErr.message : String(aiErr);
    }
  }

  // AI failed or unavailable — return a clear error with the real reason
  if (!config.ai.geminiApiKey) {
    throw createError("GEMINI_API_KEY is not set on the server. Please add it to your environment variables.", 503);
  }
  if (aiErrorMessage) {
    throw createError(`AI estimation failed: ${aiErrorMessage}`, 422);
  }
  throw createError(`Could not estimate nutrition for "${query}". The AI service returned no result.`, 422);
}
