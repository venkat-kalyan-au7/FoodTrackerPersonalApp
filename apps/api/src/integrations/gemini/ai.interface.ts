import {
  FoodNormalizationResult,
  RecipeIngredientExtractionResult,
  NutritionEstimate,
} from "@food-tracker/shared";

export interface AiFoodMatchingService {
  normalizeFoodName(query: string): Promise<FoodNormalizationResult>;
  extractRecipeIngredients(
    input: string,
    useAdvancedModel?: boolean
  ): Promise<RecipeIngredientExtractionResult>;
  estimateFoodNutrition(query: string): Promise<NutritionEstimate>;
}
