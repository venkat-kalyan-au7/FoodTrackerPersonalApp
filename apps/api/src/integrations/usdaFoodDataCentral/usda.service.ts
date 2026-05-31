// USDA FoodData Central — free API key from https://fdc.nal.usda.gov/api-key-signup.html
// Strong on packaged/branded foods, restaurant items, and basic ingredients.
// All nutrient values in the search endpoint are already per 100g.

import type {
  UsdaFoodItem,
  UsdaFoodNutrient,
  UsdaSearchResponse,
  UsdaNormalizedFood,
} from "./usda.types.js";

const BASE_URL = "https://api.nal.usda.gov/fdc/v1";

// USDA nutrient IDs (values returned per 100g by the search endpoint)
const NID_ENERGY  = 1008; // Energy (kcal)
const NID_PROTEIN = 1003; // Protein
const NID_CARBS   = 1005; // Carbohydrate, by difference
const NID_FAT     = 1004; // Total lipid (fat)
const NID_FIBER   = 1079; // Fiber, total dietary

function getVal(nutrients: UsdaFoodNutrient[], id: number): number | null {
  return nutrients.find((n) => n.nutrientId === id)?.value ?? null;
}

function normalizeItem(food: UsdaFoodItem): UsdaNormalizedFood | null {
  const kcal = getVal(food.foodNutrients, NID_ENERGY);
  if (!kcal || kcal <= 0) return null;

  return {
    fdcId: String(food.fdcId),
    name: food.description,
    caloriesPer100g: Math.round(kcal),
    proteinPer100g: getVal(food.foodNutrients, NID_PROTEIN),
    carbsPer100g: getVal(food.foodNutrients, NID_CARBS),
    fatPer100g: getVal(food.foodNutrients, NID_FAT),
    fiberPer100g: getVal(food.foodNutrients, NID_FIBER),
  };
}

export async function searchUsda(
  query: string,
  apiKey: string,
  pageSize = 5
): Promise<UsdaNormalizedFood[]> {
  const url = new URL(`${BASE_URL}/foods/search`);
  url.searchParams.set("query", query);
  url.searchParams.set("api_key", apiKey);
  url.searchParams.set("pageSize", String(pageSize));
  url.searchParams.set("dataType", "Foundation,SR Legacy,Branded");

  const response = await fetch(url.toString(), {
    signal: AbortSignal.timeout(6000),
  });

  if (!response.ok) throw new Error(`USDA API error: ${response.status}`);

  const data = (await response.json()) as UsdaSearchResponse;
  return (data.foods ?? [])
    .map(normalizeItem)
    .filter((f): f is UsdaNormalizedFood => f !== null)
    .slice(0, pageSize);
}
