import { z } from "zod";

// Simplified ingredient: frontend only sends foodId + weightG; API looks up the rest
export const RecipeIngredientInputSchema = z.object({
  foodId: z.string().uuid(),
  weightG: z.number().positive(),
});

export const CreateRecipeSchema = z.object({
  name: z.string().min(1).max(200),
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

export const ExtractIngredientsSchema = z.object({
  text: z.string().min(10).max(2000),
  useAdvancedModel: z.boolean().optional().default(false),
});

export type CreateRecipe = z.infer<typeof CreateRecipeSchema>;
export type UpdateRecipe = z.infer<typeof UpdateRecipeSchema>;
export type RecipeCalculation = z.infer<typeof RecipeCalculationSchema>;
export type RecipeIngredientInput = z.infer<typeof RecipeIngredientInputSchema>;
export type RecipeIngredientSimple = { foodId: string; weightG: number };
