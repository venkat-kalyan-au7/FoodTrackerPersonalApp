import { SupabaseClient } from "@supabase/supabase-js";
import { FoodLog, MealType } from "@food-tracker/shared";

function mapToFoodLog(row: Record<string, unknown>): FoodLog {
  return {
    id: row.id as string,
    userId: row.user_id as string,
    foodId: row.food_id as string | null,
    consumedDate: row.consumed_date as string,
    mealType: row.meal_type as MealType,
    foodNameSnapshot: row.food_name_snapshot as string,
    sourceTypeSnapshot: row.source_type_snapshot as string,
    caloriesPer100gSnapshot: row.calories_per_100g_snapshot as number | null,
    consumedWeightG: row.consumed_weight_g as number | null,
    servingQuantity: row.serving_quantity as number | null,
    servingNameSnapshot: row.serving_name_snapshot as string | null,
    calculatedCalories: row.calculated_calories as number,
    proteinPer100gSnapshot: row.protein_per_100g_snapshot as number | null,
    carbsPer100gSnapshot: row.carbs_per_100g_snapshot as number | null,
    fatPer100gSnapshot: row.fat_per_100g_snapshot as number | null,
    fiberPer100gSnapshot: row.fiber_per_100g_snapshot as number | null,
    calculatedProtein: row.calculated_protein as number | null,
    calculatedCarbs: row.calculated_carbs as number | null,
    calculatedFat: row.calculated_fat as number | null,
    calculatedFiber: row.calculated_fiber as number | null,
    note: row.note as string | null,
    imagePath: row.image_path as string | null,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

export async function createFoodLog(
  client: SupabaseClient,
  userId: string,
  data: {
    foodId: string;
    consumedDate: string;
    mealType: MealType;
    foodNameSnapshot: string;
    sourceTypeSnapshot: string;
    caloriesPer100gSnapshot: number | null;
    consumedWeightG: number | null;
    servingQuantity: number | null;
    servingNameSnapshot: string | null;
    calculatedCalories: number;
    proteinPer100gSnapshot?: number | null;
    carbsPer100gSnapshot?: number | null;
    fatPer100gSnapshot?: number | null;
    fiberPer100gSnapshot?: number | null;
    calculatedProtein?: number | null;
    calculatedCarbs?: number | null;
    calculatedFat?: number | null;
    calculatedFiber?: number | null;
    note?: string;
  }
): Promise<FoodLog> {
  const { data: inserted, error } = await client
    .from("food_logs")
    .insert({
      user_id: userId,
      food_id: data.foodId,
      consumed_date: data.consumedDate,
      meal_type: data.mealType,
      food_name_snapshot: data.foodNameSnapshot,
      source_type_snapshot: data.sourceTypeSnapshot,
      calories_per_100g_snapshot: data.caloriesPer100gSnapshot,
      consumed_weight_g: data.consumedWeightG,
      serving_quantity: data.servingQuantity,
      serving_name_snapshot: data.servingNameSnapshot,
      calculated_calories: data.calculatedCalories,
      protein_per_100g_snapshot: data.proteinPer100gSnapshot ?? null,
      carbs_per_100g_snapshot: data.carbsPer100gSnapshot ?? null,
      fat_per_100g_snapshot: data.fatPer100gSnapshot ?? null,
      fiber_per_100g_snapshot: data.fiberPer100gSnapshot ?? null,
      calculated_protein: data.calculatedProtein ?? null,
      calculated_carbs: data.calculatedCarbs ?? null,
      calculated_fat: data.calculatedFat ?? null,
      calculated_fiber: data.calculatedFiber ?? null,
      note: data.note ?? null,
    })
    .select()
    .single();

  if (error) throw new Error(`Failed to create food log: ${error.message}`);
  return mapToFoodLog(inserted);
}

export async function getFoodLogs(
  client: SupabaseClient,
  userId: string,
  date: string
): Promise<FoodLog[]> {
  const { data, error } = await client
    .from("food_logs")
    .select("*")
    .eq("user_id", userId)
    .eq("consumed_date", date)
    .order("created_at", { ascending: true });

  if (error) throw new Error(`Failed to get food logs: ${error.message}`);
  return (data ?? []).map(mapToFoodLog);
}

export async function updateFoodLog(
  client: SupabaseClient,
  logId: string,
  userId: string,
  data: {
    consumedWeightG?: number;
    servingQuantity?: number;
    mealType?: MealType;
    calculatedCalories?: number;
    note?: string;
  }
): Promise<FoodLog | null> {
  const updateData: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (data.consumedWeightG !== undefined) updateData.consumed_weight_g = data.consumedWeightG;
  if (data.servingQuantity !== undefined) updateData.serving_quantity = data.servingQuantity;
  if (data.mealType !== undefined) updateData.meal_type = data.mealType;
  if (data.calculatedCalories !== undefined) updateData.calculated_calories = data.calculatedCalories;
  if (data.note !== undefined) updateData.note = data.note;

  const { data: updated, error } = await client
    .from("food_logs")
    .update(updateData)
    .eq("id", logId)
    .eq("user_id", userId)
    .select()
    .single();

  if (error) return null;
  return mapToFoodLog(updated);
}

export async function deleteFoodLog(
  client: SupabaseClient,
  logId: string,
  userId: string
): Promise<boolean> {
  const { error } = await client
    .from("food_logs")
    .delete()
    .eq("id", logId)
    .eq("user_id", userId);

  return !error;
}
