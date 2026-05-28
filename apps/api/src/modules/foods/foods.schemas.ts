import { z } from "zod";

export const FoodSearchQuerySchema = z.object({
  q: z.string().min(1).max(200),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});

export const CreateManualFoodSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().max(500).optional(),
  caloriesPer100g: z.number().positive(),
  proteinPer100g: z.number().min(0).optional(),
  carbsPer100g: z.number().min(0).optional(),
  fatPer100g: z.number().min(0).optional(),
  defaultServingName: z.string().max(100).optional(),
  defaultServingWeightG: z.number().positive().optional(),
});

export const UpdateManualFoodSchema = CreateManualFoodSchema.partial();

export type FoodSearchQuery = z.infer<typeof FoodSearchQuerySchema>;
export type CreateManualFood = z.infer<typeof CreateManualFoodSchema>;
export type UpdateManualFood = z.infer<typeof UpdateManualFoodSchema>;
