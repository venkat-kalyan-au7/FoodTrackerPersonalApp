import { SupabaseClient } from "@supabase/supabase-js";
import { FoodLog, MealType } from "@food-tracker/shared";
import {
  createFoodLog,
  getFoodLogs,
  updateFoodLog,
  deleteFoodLog,
} from "./foodLogs.repository.js";
import { getFoodById } from "../foods/foods.repository.js";
import { createError } from "../../middleware/error.middleware.js";
import { CreateFoodLog, UpdateFoodLog } from "./foodLogs.schemas.js";

// Calorie calculation always happens on the backend
function calculateCalories(
  caloriesPer100g: number,
  consumedWeightG: number
): number {
  return (caloriesPer100g * consumedWeightG) / 100;
}

function calcMacro(per100g: number | null, weightG: number): number | null {
  if (per100g == null) return null;
  return Math.round((per100g * weightG) / 100 * 10) / 10;
}

export async function logFood(
  client: SupabaseClient,
  userId: string,
  data: CreateFoodLog
): Promise<FoodLog> {
  // Load the food to get verified nutrition data
  const food = await getFoodById(client, data.foodId);
  if (!food) {
    throw createError("Food not found", 404);
  }

  if (!food.caloriesPer100g) {
    throw createError("Food has no calorie information", 400);
  }

  // Determine consumed weight
  let consumedWeightG: number | null = null;
  let servingQuantity: number | null = null;

  if (data.consumedWeightG) {
    consumedWeightG = data.consumedWeightG;
  } else if (data.servingQuantity && food.defaultServingWeightG) {
    servingQuantity = data.servingQuantity;
    consumedWeightG = data.servingQuantity * food.defaultServingWeightG;
  } else {
    throw createError("Either consumedWeightG or servingQuantity must be provided", 400);
  }

  // Backend calculates calories - never trust frontend values
  const calculatedCalories = calculateCalories(
    food.caloriesPer100g,
    consumedWeightG
  );

  return createFoodLog(client, userId, {
    foodId: food.id,
    consumedDate: data.consumedDate,
    mealType: data.mealType as MealType,
    foodNameSnapshot: food.name,
    sourceTypeSnapshot: food.sourceType,
    caloriesPer100gSnapshot: food.caloriesPer100g,
    consumedWeightG,
    servingQuantity,
    servingNameSnapshot: food.defaultServingName,
    calculatedCalories,
    proteinPer100gSnapshot: food.proteinPer100g ?? null,
    carbsPer100gSnapshot: food.carbsPer100g ?? null,
    fatPer100gSnapshot: food.fatPer100g ?? null,
    fiberPer100gSnapshot: food.fiberPer100g ?? null,
    calculatedProtein: calcMacro(food.proteinPer100g ?? null, consumedWeightG),
    calculatedCarbs: calcMacro(food.carbsPer100g ?? null, consumedWeightG),
    calculatedFat: calcMacro(food.fatPer100g ?? null, consumedWeightG),
    calculatedFiber: calcMacro(food.fiberPer100g ?? null, consumedWeightG),
    note: data.note,
  });
}

export async function getDailyLogs(
  client: SupabaseClient,
  userId: string,
  date: string
): Promise<FoodLog[]> {
  return getFoodLogs(client, userId, date);
}

export async function editFoodLog(
  client: SupabaseClient,
  userId: string,
  logId: string,
  data: UpdateFoodLog
): Promise<FoodLog> {
  // We need to recalculate if weight changes
  let calculatedCalories: number | undefined;

  if (data.consumedWeightG) {
    // Load the existing log to get snapshot calories
    const logs = await getFoodLogs(
      client,
      userId,
      new Date().toISOString().split("T")[0]
    );
    const existingLog = logs.find((l) => l.id === logId);
    
    if (existingLog?.caloriesPer100gSnapshot) {
      calculatedCalories = calculateCalories(
        existingLog.caloriesPer100gSnapshot,
        data.consumedWeightG
      );
    }
  }

  const updated = await updateFoodLog(client, logId, userId, {
    ...data,
    calculatedCalories,
  });

  if (!updated) {
    throw createError("Food log not found or unauthorized", 404);
  }

  return updated;
}

export async function removeFoodLog(
  client: SupabaseClient,
  userId: string,
  logId: string
): Promise<void> {
  const success = await deleteFoodLog(client, logId, userId);
  if (!success) {
    throw createError("Food log not found or unauthorized", 404);
  }
}
