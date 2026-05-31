// API Ninjas Nutrition API — free 10,000 requests/month
// Get a free key at: https://api-ninjas.com/api/nutrition
// Excellent for Indian dish names: "butter chicken", "dal makhani", "biryani", "samosa", etc.
// Accepts natural language queries and returns matching food items with nutrition per serving.

const BASE_URL = "https://api.api-ninjas.com/v1/nutrition";

export interface NinjaNormalizedFood {
  name: string;
  caloriesPer100g: number;
  proteinPer100g: number | null;
  carbsPer100g: number | null;
  fatPer100g: number | null;
  fiberPer100g: number | null;
  servingSizeG: number | null;
}

interface NinjaItem {
  name: string;
  calories: number;             // per serving
  serving_size_g: number;       // serving size in grams
  protein_g: number;
  carbohydrates_total_g: number;
  fat_total_g: number;
  fiber_g: number;
}

function normalizeItem(item: NinjaItem): NinjaNormalizedFood | null {
  const servingG = item.serving_size_g > 0 ? item.serving_size_g : 100;
  if (!item.calories || item.calories <= 0) return null;

  // Convert from per-serving to per-100g
  const f = 100 / servingG;

  return {
    name: item.name.trim(),
    caloriesPer100g: Math.round(item.calories * f),
    proteinPer100g: item.protein_g != null ? Math.round(item.protein_g * f * 10) / 10 : null,
    carbsPer100g: item.carbohydrates_total_g != null ? Math.round(item.carbohydrates_total_g * f * 10) / 10 : null,
    fatPer100g: item.fat_total_g != null ? Math.round(item.fat_total_g * f * 10) / 10 : null,
    fiberPer100g: item.fiber_g != null ? Math.round(item.fiber_g * f * 10) / 10 : null,
    servingSizeG: servingG !== 100 ? servingG : null,
  };
}

export async function searchCalorieNinja(
  query: string,
  apiKey: string
): Promise<NinjaNormalizedFood[]> {
  const url = new URL(BASE_URL);
  url.searchParams.set("query", query);

  const response = await fetch(url.toString(), {
    headers: { "X-Api-Key": apiKey },
    signal: AbortSignal.timeout(5000),
  });

  if (!response.ok) return [];

  const data = (await response.json()) as NinjaItem[];
  return (Array.isArray(data) ? data : [])
    .map(normalizeItem)
    .filter((f): f is NinjaNormalizedFood => f !== null);
}
