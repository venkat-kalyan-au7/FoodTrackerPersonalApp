export interface UsdaFoodNutrient {
  nutrientId: number;
  nutrientName: string;
  unitName: string;
  value: number;
}

export interface UsdaFoodItem {
  fdcId: number;
  description: string;
  foodNutrients: UsdaFoodNutrient[];
  servingSize?: number;
  servingSizeUnit?: string;
  dataType?: string;
}

export interface UsdaSearchResponse {
  foods: UsdaFoodItem[];
  totalHits: number;
}

export interface UsdaNormalizedFood {
  fdcId: string;
  name: string;
  caloriesPer100g: number | null;
  proteinPer100g: number | null;
  carbsPer100g: number | null;
  fatPer100g: number | null;
  fiberPer100g: number | null;
}
