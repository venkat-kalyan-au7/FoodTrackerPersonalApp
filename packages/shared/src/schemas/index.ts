import { z } from "zod";

export const MealTypeSchema = z.enum(["BREAKFAST", "LUNCH", "DINNER", "SNACKS"]);
export const UserRoleSchema = z.enum(["ADMIN", "USER"]);
export const PreferredUnitSchema = z.enum(["GRAMS", "SERVINGS"]);
export const FoodTypeSchema = z.enum(["SYSTEM", "EXTERNAL", "USER_MANUAL", "RECIPE"]);
export const SourceTypeSchema = z.enum([
  "INDIAN_REFERENCE",
  "USDA_FDC",
  "USER_MANUAL",
  "USER_RECIPE",
]);

export const UpdateProfileSchema = z.object({
  fullName: z.string().min(1).max(100).optional(),
  gender: z.enum(["MALE", "FEMALE", "OTHER"]).nullable().optional(),
  dateOfBirth: z.string().nullable().optional(),
  heightCm: z.number().positive().nullable().optional(),
  weightKg: z.number().positive().nullable().optional(),
  targetWeightKg: z.number().positive().nullable().optional(),
  preferredUnit: PreferredUnitSchema.optional(),
});

export const UpdateCalorieGoalSchema = z.object({
  calorieGoal: z.number().positive().min(100).max(10000),
  effectiveFrom: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

export const CreateFoodLogSchema = z.object({
  foodId: z.string().uuid(),
  consumedDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  mealType: MealTypeSchema,
  consumedWeightG: z.number().positive().optional(),
  servingQuantity: z.number().positive().optional(),
  note: z.string().max(500).optional(),
});

export const UpdateFoodLogSchema = z.object({
  consumedWeightG: z.number().positive().optional(),
  servingQuantity: z.number().positive().optional(),
  mealType: MealTypeSchema.optional(),
  note: z.string().max(500).optional(),
});

export const CreateManualFoodSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().max(500).optional(),
  caloriesPer100g: z.number().positive(),
  proteinPer100g: z.number().min(0).optional(),
  carbsPer100g: z.number().min(0).optional(),
  fatPer100g: z.number().min(0).optional(),
  fiberPer100g: z.number().min(0).optional(),
  defaultServingName: z.string().max(100).optional(),
  defaultServingWeightG: z.number().positive().optional(),
});

export const RecipeIngredientInputSchema = z.object({
  foodId: z.string().uuid().optional(),
  ingredientName: z.string().min(1).max(200),
  quantity: z.number().positive(),
  unit: z.string().min(1).max(50),
  weightG: z.number().positive(),
  caloriesPer100g: z.number().positive(),
});

export const CreateRecipeSchema = z.object({
  recipeName: z.string().min(1).max(200),
  description: z.string().max(500).optional(),
  instructions: z.string().max(2000).optional(),
  finalWeightG: z.number().positive().optional(),
  servings: z.number().positive().optional(),
  ingredients: z.array(RecipeIngredientInputSchema).min(1),
});

export const UpdateRecipeSchema = CreateRecipeSchema.partial();

export const RecipeCalculationSchema = z.object({
  recipeName: z.string().min(1),
  ingredients: z.array(
    z.object({
      foodId: z.string().uuid(),
      weightG: z.number().positive(),
    })
  ).min(1),
  finalWeightG: z.number().positive().optional(),
  servings: z.number().positive().optional(),
});

export const InviteUserSchema = z.object({
  email: z.string().email(),
});

export const NutritionEstimateSchema = z.object({
  foodName: z.string().min(1),
  caloriesPer100g: z.number().min(0),
  proteinPer100g: z.number().min(0),
  carbsPer100g: z.number().min(0),
  fatPer100g: z.number().min(0),
  fiberPer100g: z.number().min(0),
  defaultServingWeightG: z.number().positive().nullable(),
  confidence: z.number().min(0).max(1),
});

export const FoodNormalizationResultSchema = z.object({
  originalQuery: z.string().min(1),
  normalizedFoodName: z.string().min(1),
  suggestedSearchTerms: z.array(z.string().min(1)),
  confidence: z.number().min(0).max(1),
});

export const RecipeIngredientExtractionSchema = z.object({
  recipeName: z.string().optional(),
  ingredients: z.array(
    z.object({
      name: z.string().min(1),
      quantity: z.number().positive(),
      unit: z.string().min(1),
    })
  ),
  confidence: z.number().min(0).max(1),
});

export type FoodNormalizationResult = z.infer<typeof FoodNormalizationResultSchema>;
export type RecipeIngredientExtractionResult = z.infer<typeof RecipeIngredientExtractionSchema>;
// NutritionEstimate type is exported from types/index.ts; NutritionEstimateSchema is the Zod validator
export type CreateFoodLog = z.infer<typeof CreateFoodLogSchema>;
export type UpdateFoodLog = z.infer<typeof UpdateFoodLogSchema>;
export type CreateManualFood = z.infer<typeof CreateManualFoodSchema>;
export type CreateRecipe = z.infer<typeof CreateRecipeSchema>;
export type UpdateRecipe = z.infer<typeof UpdateRecipeSchema>;
export type UpdateProfile = z.infer<typeof UpdateProfileSchema>;
export type UpdateCalorieGoal = z.infer<typeof UpdateCalorieGoalSchema>;
