export interface UsdaFoodNutrient {
  nutrientId: number;
  nutrientName: string;
  unitName: string;
  value: number;
}

export interface UsdaFoodItem {
  fdcId: number;
  description: string;
  dataType: string;
  publishedDate?: string;
  brandOwner?: string;
  foodNutrients: UsdaFoodNutrient[];
  servingSize?: number;
  servingSizeUnit?: string;
}

export interface UsdaSearchResponse {
  totalHits: number;
  currentPage: number;
  totalPages: number;
  foods: UsdaFoodItem[];
}

export interface NormalizedFoodResult {
  fdcId: string;
  name: string;
  caloriesPer100g: number | null;
  proteinPer100g: number | null;
  carbsPer100g: number | null;
  fatPer100g: number | null;
  fiberPer100g: number | null;
  servingSize: number | null;
  servingSizeUnit: string | null;
}

// USDA Nutrient IDs
export const USDA_NUTRIENT_IDS = {
  ENERGY_KCAL: 1008,
  PROTEIN: 1003,
  CARBS: 1005,
  FAT: 1004,
  FIBER: 1079,
  SUGAR: 2000,
} as const;
