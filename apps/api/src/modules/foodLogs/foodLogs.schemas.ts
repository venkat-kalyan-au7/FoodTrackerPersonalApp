import { z } from "zod";

export const CreateFoodLogSchema = z.object({
  foodId: z.string().uuid(),
  consumedDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format YYYY-MM-DD"),
  mealType: z.enum(["BREAKFAST", "LUNCH", "DINNER", "SNACKS"]),
  consumedWeightG: z.number().positive().optional(),
  servingQuantity: z.number().positive().optional(),
  note: z.string().max(500).optional(),
});

export const UpdateFoodLogSchema = z.object({
  consumedWeightG: z.number().positive().optional(),
  servingQuantity: z.number().positive().optional(),
  mealType: z.enum(["BREAKFAST", "LUNCH", "DINNER", "SNACKS"]).optional(),
  note: z.string().max(500).optional(),
});

export const FoodLogQuerySchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
});

export type CreateFoodLog = z.infer<typeof CreateFoodLogSchema>;
export type UpdateFoodLog = z.infer<typeof UpdateFoodLogSchema>;
