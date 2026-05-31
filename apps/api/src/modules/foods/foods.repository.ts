import { SupabaseClient } from "@supabase/supabase-js";
import { FoodSearchResult, Food } from "@food-tracker/shared";

function normalizeText(text: string): string {
  return text.toLowerCase().trim().replace(/\s+/g, " ");
}

function mapToSearchResult(row: Record<string, unknown>): FoodSearchResult {
  return {
    id: row.id as string,
    name: row.name as string,
    foodType: row.food_type as FoodSearchResult["foodType"],
    sourceType: row.source_type as FoodSearchResult["sourceType"],
    caloriesPer100g: row.calories_per_100g as number | null,
    proteinPer100g: row.protein_per_100g as number | null,
    carbsPer100g: row.carbs_per_100g as number | null,
    fatPer100g: row.fat_per_100g as number | null,
    fiberPer100g: row.fiber_per_100g as number | null,
    defaultServingName: row.default_serving_name as string | null,
    defaultServingWeightG: row.default_serving_weight_g as number | null,
    isVerified: row.is_verified as boolean,
    requiresVariationWarning: row.requires_variation_warning as boolean,
    imageUrl: row.image_path as string | null,
    description: row.description as string | null,
  };
}

export async function searchFoodsInDb(
  client: SupabaseClient,
  userId: string,
  query: string,
  limit = 20
): Promise<FoodSearchResult[]> {
  const normalized = normalizeText(query);
  const results: FoodSearchResult[] = [];
  const seenIds = new Set<string>();

  // 1. Search user's recipes (food_type = RECIPE, owner = userId)
  const { data: recipeFoods } = await client
    .from("foods")
    .select("*")
    .eq("food_type", "RECIPE")
    .eq("owner_user_id", userId)
    .ilike("normalized_name", `%${normalized}%`)
    .limit(5);

  for (const row of recipeFoods ?? []) {
    if (!seenIds.has(row.id)) {
      results.push(mapToSearchResult(row));
      seenIds.add(row.id);
    }
  }

  // 2. Search favourite foods
  const { data: favFoods } = await client
    .from("favourites")
    .select("food_id, foods(*)")
    .eq("user_id", userId)
    .limit(5);

  for (const row of favFoods ?? []) {
    const food = (row.foods as unknown) as Record<string, unknown> | null;
    if (
      food &&
      !seenIds.has(food.id as string) &&
      normalizeText(food.normalized_name as string).includes(normalized)
    ) {
      results.push(mapToSearchResult(food));
      seenIds.add(food.id as string);
    }
  }

  // 3. Search recently used foods (from food_logs)
  const { data: recentLogs } = await client
    .from("food_logs")
    .select("food_id, food_name_snapshot, foods(*)")
    .eq("user_id", userId)
    .not("food_id", "is", null)
    .ilike("food_name_snapshot", `%${normalized}%`)
    .order("created_at", { ascending: false })
    .limit(5);

  for (const row of recentLogs ?? []) {
    const food = (row.foods as unknown) as Record<string, unknown> | null;
    if (food && !seenIds.has(food.id as string)) {
      results.push(mapToSearchResult(food));
      seenIds.add(food.id as string);
    }
  }

  // 4. Search global foods (system/external, owner = null)
  const { data: globalFoods } = await client
    .from("foods")
    .select("*")
    .is("owner_user_id", null)
    .ilike("normalized_name", `%${normalized}%`)
    .limit(10);

  for (const row of globalFoods ?? []) {
    if (!seenIds.has(row.id)) {
      results.push(mapToSearchResult(row));
      seenIds.add(row.id);
    }
  }

  // 5. Search aliases
  const { data: aliases } = await client
    .from("food_aliases")
    .select("food_id, foods(*)")
    .ilike("normalized_alias", `%${normalized}%`)
    .limit(5);

  for (const row of aliases ?? []) {
    const food = (row.foods as unknown) as Record<string, unknown> | null;
    if (food && !seenIds.has(food.id as string)) {
      results.push(mapToSearchResult(food));
      seenIds.add(food.id as string);
    }
  }

  // 6. Search user's own manual foods
  const { data: userFoods } = await client
    .from("foods")
    .select("*")
    .eq("owner_user_id", userId)
    .eq("food_type", "USER_MANUAL")
    .ilike("normalized_name", `%${normalized}%`)
    .limit(5);

  for (const row of userFoods ?? []) {
    if (!seenIds.has(row.id)) {
      results.push(mapToSearchResult(row));
      seenIds.add(row.id);
    }
  }

  return results.slice(0, limit);
}

export async function getFoodById(
  client: SupabaseClient,
  foodId: string
): Promise<Food | null> {
  const { data, error } = await client
    .from("foods")
    .select("*")
    .eq("id", foodId)
    .single();

  if (error || !data) return null;

  return {
    id: data.id,
    ownerUserId: data.owner_user_id,
    name: data.name,
    normalizedName: data.normalized_name,
    description: data.description,
    foodType: data.food_type,
    sourceType: data.source_type,
    sourceReferenceId: data.source_reference_id,
    caloriesPer100g: data.calories_per_100g,
    proteinPer100g: data.protein_per_100g,
    carbsPer100g: data.carbs_per_100g,
    fatPer100g: data.fat_per_100g,
    fiberPer100g: data.fiber_per_100g ?? null,
    defaultServingName: data.default_serving_name,
    defaultServingWeightG: data.default_serving_weight_g,
    imagePath: data.image_path,
    isVerified: data.is_verified,
    requiresVariationWarning: data.requires_variation_warning,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };
}

export async function createManualFood(
  client: SupabaseClient,
  userId: string,
  data: {
    name: string;
    description?: string;
    caloriesPer100g: number;
    proteinPer100g?: number;
    carbsPer100g?: number;
    fatPer100g?: number;
    fiberPer100g?: number;
    defaultServingName?: string;
    defaultServingWeightG?: number;
  }
): Promise<Food> {
  const { data: inserted, error } = await client
    .from("foods")
    .insert({
      owner_user_id: userId,
      name: data.name,
      normalized_name: normalizeText(data.name),
      description: data.description ?? null,
      food_type: "USER_MANUAL",
      source_type: "USER_MANUAL",
      calories_per_100g: data.caloriesPer100g,
      protein_per_100g: data.proteinPer100g ?? null,
      carbs_per_100g: data.carbsPer100g ?? null,
      fat_per_100g: data.fatPer100g ?? null,
      fiber_per_100g: data.fiberPer100g ?? null,
      default_serving_name: data.defaultServingName ?? null,
      default_serving_weight_g: data.defaultServingWeightG ?? null,
      is_verified: false,
      requires_variation_warning: false,
    })
    .select()
    .single();

  if (error) throw new Error(`Failed to create food: ${error.message}`);
  return getFoodById(client, inserted.id) as Promise<Food>;
}

export async function cacheFoodFromUsda(
  adminClient: SupabaseClient,
  fdcId: string,
  name: string,
  caloriesPer100g: number,
  proteinPer100g: number | null,
  carbsPer100g: number | null,
  fatPer100g: number | null,
  fiberPer100g: number | null,
  rawResponseJson: unknown
): Promise<Food> {
  // Check if already cached
  const { data: existing } = await adminClient
    .from("foods")
    .select("*")
    .eq("source_type", "USDA_FDC")
    .eq("source_reference_id", fdcId)
    .is("owner_user_id", null)
    .single();

  if (existing) {
    return getFoodById(adminClient, existing.id) as Promise<Food>;
  }

  const { data: inserted, error } = await adminClient
    .from("foods")
    .insert({
      owner_user_id: null,
      name,
      normalized_name: normalizeText(name),
      food_type: "EXTERNAL",
      source_type: "USDA_FDC",
      source_reference_id: fdcId,
      calories_per_100g: caloriesPer100g,
      protein_per_100g: proteinPer100g,
      carbs_per_100g: carbsPer100g,
      fat_per_100g: fatPer100g,
      fiber_per_100g: fiberPer100g,
      is_verified: false,
      requires_variation_warning: false,
    })
    .select()
    .single();

  if (error) throw new Error(`Failed to cache USDA food: ${error.message}`);

  // Also cache in external_food_cache table
  await adminClient.from("external_food_cache").insert({
    provider: "USDA_FDC",
    provider_food_id: fdcId,
    search_term: name,
    raw_response_json: rawResponseJson,
    transformed_food_id: inserted.id,
    expires_at: new Date(
      Date.now() + 30 * 24 * 60 * 60 * 1000
    ).toISOString(),
  });

  return getFoodById(adminClient, inserted.id) as Promise<Food>;
}

/**
 * Return a previously-cached AI food for this query without hitting Gemini.
 * Checks source_reference_id = 'ai:<normalized-query>'.
 */
export async function getCachedAiFood(
  adminClient: SupabaseClient,
  query: string
): Promise<Food | null> {
  const refId = `ai:${normalizeText(query)}`;
  const { data } = await adminClient
    .from("foods")
    .select("*")
    .eq("source_reference_id", refId)
    .is("owner_user_id", null)
    .maybeSingle();
  if (!data) return null;
  return getFoodById(adminClient, data.id);
}

export async function cacheAiFood(
  adminClient: SupabaseClient,
  query: string,
  estimate: {
    foodName: string;
    caloriesPer100g: number;
    proteinPer100g: number;
    carbsPer100g: number;
    fatPer100g: number;
    fiberPer100g: number;
    defaultServingWeightG: number | null;
  }
): Promise<Food> {
  // Check if we already have a cached AI food for this query
  const normalized = normalizeText(estimate.foodName);
  const { data: existing } = await adminClient
    .from("foods")
    .select("*")
    .eq("source_type", "USER_MANUAL")
    .eq("food_type", "EXTERNAL")
    .eq("normalized_name", normalized)
    .is("owner_user_id", null)
    .single();

  if (existing) {
    return getFoodById(adminClient, existing.id) as Promise<Food>;
  }

  const { data: inserted, error } = await adminClient
    .from("foods")
    .insert({
      owner_user_id: null,
      name: estimate.foodName,
      normalized_name: normalized,
      food_type: "EXTERNAL",
      source_type: "USER_MANUAL",
      source_reference_id: `ai:${normalizeText(query)}`,
      calories_per_100g: estimate.caloriesPer100g,
      protein_per_100g: estimate.proteinPer100g,
      carbs_per_100g: estimate.carbsPer100g,
      fat_per_100g: estimate.fatPer100g,
      fiber_per_100g: estimate.fiberPer100g,
      default_serving_weight_g: estimate.defaultServingWeightG,
      is_verified: false,
      requires_variation_warning: true,
    })
    .select()
    .single();

  if (error) throw new Error(`Failed to cache AI food: ${error.message}`);
  return getFoodById(adminClient, inserted.id) as Promise<Food>;
}

export async function cacheFoodFromOFF(
  adminClient: SupabaseClient,
  offId: string,
  name: string,
  caloriesPer100g: number,
  proteinPer100g: number | null,
  carbsPer100g: number | null,
  fatPer100g: number | null,
  fiberPer100g: number | null,
  servingSizeG: number | null
): Promise<Food> {
  const { data: existing } = await adminClient
    .from("foods")
    .select("*")
    .eq("source_type", "OPEN_FOOD_FACTS")
    .eq("source_reference_id", offId)
    .is("owner_user_id", null)
    .single();

  if (existing) {
    return getFoodById(adminClient, existing.id) as Promise<Food>;
  }

  const { data: inserted, error } = await adminClient
    .from("foods")
    .insert({
      owner_user_id: null,
      name,
      normalized_name: normalizeText(name),
      food_type: "EXTERNAL",
      source_type: "OPEN_FOOD_FACTS",
      source_reference_id: offId,
      calories_per_100g: caloriesPer100g,
      protein_per_100g: proteinPer100g,
      carbs_per_100g: carbsPer100g,
      fat_per_100g: fatPer100g,
      fiber_per_100g: fiberPer100g,
      default_serving_weight_g: servingSizeG,
      is_verified: false,
      requires_variation_warning: false,
    })
    .select()
    .single();

  if (error) throw new Error(`Failed to cache Open Food Facts food: ${error.message}`);
  return getFoodById(adminClient, inserted.id) as Promise<Food>;
}

export async function cacheCalorieNinjaFood(
  adminClient: SupabaseClient,
  name: string,
  caloriesPer100g: number,
  proteinPer100g: number | null,
  carbsPer100g: number | null,
  fatPer100g: number | null,
  fiberPer100g: number | null,
  servingSizeG: number | null
): Promise<Food> {
  const normalized = normalizeText(name);
  const refId = `ninja:${normalized}`;

  const { data: existing } = await adminClient
    .from("foods")
    .select("*")
    .eq("source_type", "CALORIE_NINJA")
    .eq("source_reference_id", refId)
    .is("owner_user_id", null)
    .maybeSingle();

  if (existing) {
    return getFoodById(adminClient, existing.id) as Promise<Food>;
  }

  const { data: inserted, error } = await adminClient
    .from("foods")
    .insert({
      owner_user_id: null,
      name,
      normalized_name: normalized,
      food_type: "EXTERNAL",
      source_type: "CALORIE_NINJA",
      source_reference_id: refId,
      calories_per_100g: caloriesPer100g,
      protein_per_100g: proteinPer100g,
      carbs_per_100g: carbsPer100g,
      fat_per_100g: fatPer100g,
      fiber_per_100g: fiberPer100g,
      default_serving_weight_g: servingSizeG,
      is_verified: false,
      requires_variation_warning: true,
    })
    .select()
    .single();

  if (error) throw new Error(`Failed to cache CalorieNinja food: ${error.message}`);
  return getFoodById(adminClient, inserted.id) as Promise<Food>;
}
