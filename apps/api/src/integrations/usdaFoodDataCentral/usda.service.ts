import { config } from "../../config/index.js";
import {
  UsdaSearchResponse,
  UsdaFoodItem,
  NormalizedFoodResult,
  USDA_NUTRIENT_IDS,
} from "./usda.types.js";

const BASE_URL = config.usda.baseUrl;

async function fetchUsda<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const separator = endpoint.includes("?") ? "&" : "?";
  const url = `${BASE_URL}${endpoint}${separator}api_key=${config.usda.apiKey}`;
  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`USDA API error: ${response.status} ${response.statusText}`);
  }

  return response.json() as Promise<T>;
}

function getNutrientValue(
  food: UsdaFoodItem,
  nutrientId: number
): number | null {
  const nutrient = food.foodNutrients.find((n) => n.nutrientId === nutrientId);
  return nutrient ? nutrient.value : null;
}

function normalizeUsdaFood(food: UsdaFoodItem): NormalizedFoodResult {
  return {
    fdcId: String(food.fdcId),
    name: food.description,
    caloriesPer100g: getNutrientValue(food, USDA_NUTRIENT_IDS.ENERGY_KCAL),
    proteinPer100g: getNutrientValue(food, USDA_NUTRIENT_IDS.PROTEIN),
    carbsPer100g: getNutrientValue(food, USDA_NUTRIENT_IDS.CARBS),
    fatPer100g: getNutrientValue(food, USDA_NUTRIENT_IDS.FAT),
    fiberPer100g: getNutrientValue(food, USDA_NUTRIENT_IDS.FIBER),
    servingSize: food.servingSize ?? null,
    servingSizeUnit: food.servingSizeUnit ?? null,
  };
}

export async function searchUsdaFoods(
  query: string,
  pageSize = 10
): Promise<NormalizedFoodResult[]> {
  if (!config.usda.apiKey) {
    return [];
  }

  const body = {
    query,
    pageSize,
    dataType: ["Foundation", "SR Legacy", "Survey (FNDDS)", "Branded"],
  };

  const response = await fetchUsda<UsdaSearchResponse>("/foods/search", {
    method: "POST",
    body: JSON.stringify(body),
  });

  return response.foods.map(normalizeUsdaFood);
}

export async function getUsdaFoodById(
  fdcId: string
): Promise<NormalizedFoodResult | null> {
  if (!config.usda.apiKey) return null;

  const food = await fetchUsda<UsdaFoodItem>(
    `/food/${fdcId}?api_key=${config.usda.apiKey}`
  );

  if (!food) return null;
  return normalizeUsdaFood(food);
}
