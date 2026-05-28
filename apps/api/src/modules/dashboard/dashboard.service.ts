import { SupabaseClient } from "@supabase/supabase-js";
import { DashboardData, FoodLog, FoodSearchResult, WeeklySummary } from "@food-tracker/shared";
import { getRecentFoods } from "../foods/foods.service.js";

export async function getDashboardData(
  client: SupabaseClient,
  userId: string,
  date: string
): Promise<DashboardData> {
  // Get active calorie goal
  const { data: goalData } = await client
    .from("calorie_goals")
    .select("calorie_goal")
    .eq("user_id", userId)
    .lte("effective_from", date)
    .or(`effective_to.is.null,effective_to.gte.${date}`)
    .order("effective_from", { ascending: false })
    .limit(1)
    .single();

  // Fallback to profile goal if no calorie_goals entry
  let calorieGoal = 2000;
  if (goalData) {
    calorieGoal = goalData.calorie_goal;
  } else {
    const { data: profile } = await client
      .from("profiles")
      .select("daily_calorie_goal")
      .eq("id", userId)
      .single();
    if (profile) calorieGoal = profile.daily_calorie_goal;
  }

  // Get food logs for the day — select all fields for mealBreakdown
  const { data: logs } = await client
    .from("food_logs")
    .select("*")
    .eq("user_id", userId)
    .eq("consumed_date", date);

  const mealBreakdown: Record<string, FoodLog[]> = {
    BREAKFAST: [],
    LUNCH: [],
    DINNER: [],
    SNACKS: [],
  };
  const mealSummary = { breakfast: 0, lunch: 0, dinner: 0, snacks: 0 };
  let totalConsumed = 0;
  let totalProtein = 0;
  let totalCarbs = 0;
  let totalFat = 0;
  let totalFiber = 0;

  for (const log of logs ?? []) {
    const calories = Number(log.calculated_calories) || 0;
    totalConsumed += calories;
    totalProtein += Number(log.calculated_protein) || 0;
    totalCarbs += Number(log.calculated_carbs) || 0;
    totalFat += Number(log.calculated_fat) || 0;
    totalFiber += Number(log.calculated_fiber) || 0;

    const foodLog: FoodLog = {
      id: log.id,
      userId: log.user_id,
      foodId: log.food_id,
      consumedDate: log.consumed_date,
      mealType: log.meal_type,
      foodNameSnapshot: log.food_name_snapshot,
      sourceTypeSnapshot: log.source_type_snapshot,
      caloriesPer100gSnapshot: log.calories_per_100g_snapshot != null ? Number(log.calories_per_100g_snapshot) : null,
      consumedWeightG: log.consumed_weight_g != null ? Number(log.consumed_weight_g) : null,
      servingQuantity: log.serving_quantity != null ? Number(log.serving_quantity) : null,
      servingNameSnapshot: log.serving_name_snapshot,
      calculatedCalories: calories,
      proteinPer100gSnapshot: log.protein_per_100g_snapshot != null ? Number(log.protein_per_100g_snapshot) : null,
      carbsPer100gSnapshot: log.carbs_per_100g_snapshot != null ? Number(log.carbs_per_100g_snapshot) : null,
      fatPer100gSnapshot: log.fat_per_100g_snapshot != null ? Number(log.fat_per_100g_snapshot) : null,
      fiberPer100gSnapshot: log.fiber_per_100g_snapshot != null ? Number(log.fiber_per_100g_snapshot) : null,
      calculatedProtein: log.calculated_protein != null ? Number(log.calculated_protein) : null,
      calculatedCarbs: log.calculated_carbs != null ? Number(log.calculated_carbs) : null,
      calculatedFat: log.calculated_fat != null ? Number(log.calculated_fat) : null,
      calculatedFiber: log.calculated_fiber != null ? Number(log.calculated_fiber) : null,
      note: log.note,
      imagePath: log.image_path,
      createdAt: log.created_at,
      updatedAt: log.updated_at,
    };

    const mealType = log.meal_type as string;
    if (mealBreakdown[mealType]) {
      mealBreakdown[mealType].push(foodLog);
    } else {
      mealBreakdown[mealType] = [foodLog];
    }

    switch (mealType) {
      case "BREAKFAST": mealSummary.breakfast += calories; break;
      case "LUNCH": mealSummary.lunch += calories; break;
      case "DINNER": mealSummary.dinner += calories; break;
      case "SNACKS": mealSummary.snacks += calories; break;
    }
  }

  const remainingCalories = calorieGoal - totalConsumed;
  const progressPercentage = Math.min((totalConsumed / calorieGoal) * 100, 100);

  // Get favourites
  const { data: favData } = await client
    .from("favourites")
    .select("foods(*)")
    .eq("user_id", userId)
    .limit(5);

  const favouriteFoods: FoodSearchResult[] = (favData ?? []).map((f) => {
    const food = f.foods as Record<string, unknown>;
    return {
      id: food.id as string,
      name: food.name as string,
      foodType: food.food_type as FoodSearchResult["foodType"],
      sourceType: food.source_type as FoodSearchResult["sourceType"],
      caloriesPer100g: food.calories_per_100g as number | null,
      proteinPer100g: food.protein_per_100g as number | null,
      carbsPer100g: food.carbs_per_100g as number | null,
      fatPer100g: food.fat_per_100g as number | null,
      fiberPer100g: food.fiber_per_100g as number | null,
      defaultServingName: food.default_serving_name as string | null,
      defaultServingWeightG: food.default_serving_weight_g as number | null,
      isVerified: food.is_verified as boolean,
      requiresVariationWarning: food.requires_variation_warning as boolean,
      imageUrl: food.image_path as string | null,
      description: food.description as string | null,
    };
  });

  // Get recent foods
  const recentFoods = await getRecentFoods(client, userId, 5);

  return {
    date,
    calorieGoal,
    totalCaloriesConsumed: Math.round(totalConsumed * 10) / 10,
    remainingCalories: Math.round(remainingCalories * 10) / 10,
    progressPercentage: Math.round(progressPercentage * 100) / 100,
    totalProtein: Math.round(totalProtein * 10) / 10,
    totalCarbs: Math.round(totalCarbs * 10) / 10,
    totalFat: Math.round(totalFat * 10) / 10,
    totalFiber: Math.round(totalFiber * 10) / 10,
    mealBreakdown,
    mealSummary: {
      breakfast: Math.round(mealSummary.breakfast),
      lunch: Math.round(mealSummary.lunch),
      dinner: Math.round(mealSummary.dinner),
      snacks: Math.round(mealSummary.snacks),
    },
    recentFoods,
    favouriteFoods,
  };
}

export async function getWeeklySummary(
  client: SupabaseClient,
  userId: string,
  startDate: string
): Promise<WeeklySummary> {
  const start = new Date(startDate);
  const days: Array<{ date: string; consumed: number; goal: number; withinGoal: boolean }> = [];

  // Get profile goal as fallback
  const { data: profile } = await client
    .from("profiles")
    .select("daily_calorie_goal")
    .eq("id", userId)
    .single();
  const defaultGoal = profile?.daily_calorie_goal ?? 2000;

  for (let i = 0; i < 7; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    const dateStr = d.toISOString().split("T")[0];

    // Get goal for this date
    const { data: goalData } = await client
      .from("calorie_goals")
      .select("calorie_goal")
      .eq("user_id", userId)
      .lte("effective_from", dateStr)
      .or(`effective_to.is.null,effective_to.gte.${dateStr}`)
      .order("effective_from", { ascending: false })
      .limit(1)
      .single();

    const goal = goalData?.calorie_goal ?? defaultGoal;

    const { data: logs } = await client
      .from("food_logs")
      .select("calculated_calories")
      .eq("user_id", userId)
      .eq("consumed_date", dateStr);

    const consumed = (logs ?? []).reduce(
      (sum, l) => sum + (l.calculated_calories ?? 0),
      0
    );

    days.push({ date: dateStr, consumed: Math.round(consumed), goal, withinGoal: consumed <= goal });
  }

  const totalConsumed = days.reduce((sum, d) => sum + d.consumed, 0);
  const averageConsumed = totalConsumed / 7;
  const daysWithinGoal = days.filter((d) => d.withinGoal).length;
  const daysAboveGoal = 7 - daysWithinGoal;

  const endDate = new Date(start);
  endDate.setDate(start.getDate() + 6);

  return {
    startDate,
    endDate: endDate.toISOString().split("T")[0],
    dailyData: days,
    averageConsumed: Math.round(averageConsumed),
    daysWithinGoal,
    daysAboveGoal,
  };
}
