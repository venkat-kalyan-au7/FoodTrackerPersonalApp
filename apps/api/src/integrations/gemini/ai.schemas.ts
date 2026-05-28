import { z } from "zod";
import {
  FoodNormalizationResultSchema,
  RecipeIngredientExtractionSchema,
  NutritionEstimateSchema,
} from "@food-tracker/shared";

export { FoodNormalizationResultSchema, RecipeIngredientExtractionSchema, NutritionEstimateSchema };

export type FoodNormalizationResult = z.infer<typeof FoodNormalizationResultSchema>;
export type RecipeIngredientExtractionResult = z.infer<
  typeof RecipeIngredientExtractionSchema
>;
