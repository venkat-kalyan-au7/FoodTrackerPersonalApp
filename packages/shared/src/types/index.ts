// ──────────────────────────────────────────────
// Shared Types
// ──────────────────────────────────────────────

export type UserRole = "ADMIN" | "USER";
export type MealType = "BREAKFAST" | "LUNCH" | "DINNER" | "SNACKS";
export type PreferredUnit = "GRAMS" | "SERVINGS";
export type InvitationStatus = "PENDING" | "ACCEPTED" | "EXPIRED" | "DEACTIVATED";

export type FoodType = "SYSTEM" | "EXTERNAL" | "USER_MANUAL" | "RECIPE";
export type SourceType =
  | "INDIAN_REFERENCE"
  | "USDA_FDC"
  | "OPEN_FOOD_FACTS"
  | "CALORIE_NINJA"
  | "USER_MANUAL"
  | "USER_RECIPE";

export interface UserProfile {
  id: string;
  email: string;
  fullName: string | null;
  role: UserRole;
  gender: string | null;
  dateOfBirth: string | null;
  heightCm: number | null;
  weightKg: number | null;
  targetWeightKg: number | null;
  dailyCalorieGoal: number;
  preferredUnit: PreferredUnit;
  profileImagePath: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Food {
  id: string;
  ownerUserId: string | null;
  name: string;
  normalizedName: string;
  description: string | null;
  foodType: FoodType;
  sourceType: SourceType;
  sourceReferenceId: string | null;
  caloriesPer100g: number | null;
  proteinPer100g: number | null;
  carbsPer100g: number | null;
  fatPer100g: number | null;
  fiberPer100g: number | null;
  defaultServingName: string | null;
  defaultServingWeightG: number | null;
  imagePath: string | null;
  isVerified: boolean;
  requiresVariationWarning: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface FoodSearchResult {
  id: string;
  name: string;
  foodType: FoodType;
  sourceType: SourceType;
  caloriesPer100g: number | null;
  proteinPer100g: number | null;
  carbsPer100g: number | null;
  fatPer100g: number | null;
  fiberPer100g: number | null;
  defaultServingName: string | null;
  defaultServingWeightG: number | null;
  isVerified: boolean;
  requiresVariationWarning: boolean;
  imageUrl: string | null;
  description: string | null;
}

export interface FoodLog {
  id: string;
  userId: string;
  foodId: string | null;
  consumedDate: string;
  mealType: MealType;
  foodNameSnapshot: string;
  sourceTypeSnapshot: string;
  caloriesPer100gSnapshot: number | null;
  consumedWeightG: number | null;
  servingQuantity: number | null;
  servingNameSnapshot: string | null;
  calculatedCalories: number;
  proteinPer100gSnapshot: number | null;
  carbsPer100gSnapshot: number | null;
  fatPer100gSnapshot: number | null;
  fiberPer100gSnapshot: number | null;
  calculatedProtein: number | null;
  calculatedCarbs: number | null;
  calculatedFat: number | null;
  calculatedFiber: number | null;
  note: string | null;
  imagePath: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Recipe {
  id: string;
  userId: string;
  foodId: string | null;
  recipeName: string;
  description: string | null;
  instructions: string | null;
  finalWeightG: number | null;
  servings: number | null;
  totalCalories: number;
  caloriesPer100g: number | null;
  caloriesPerServing: number | null;
  imagePath: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface RecipeIngredient {
  id: string;
  recipeId: string;
  ingredientFoodId: string | null;
  ingredientNameSnapshot: string;
  quantity: number;
  unit: string;
  weightG: number;
  caloriesPer100gSnapshot: number;
  caloriesSnapshot: number;
  createdAt: string;
}

export interface CalorieGoal {
  id: string;
  userId: string;
  calorieGoal: number;
  effectiveFrom: string;
  effectiveTo: string | null;
  createdAt: string;
}

export interface DashboardData {
  date: string;
  calorieGoal: number;
  totalCaloriesConsumed: number;
  remainingCalories: number;
  progressPercentage: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  totalFiber: number;
  mealBreakdown: Record<string, FoodLog[]>;
  mealSummary: {
    breakfast: number;
    lunch: number;
    dinner: number;
    snacks: number;
  };
  recentFoods: FoodSearchResult[];
  favouriteFoods: FoodSearchResult[];
}

export interface WeeklySummary {
  startDate: string;
  endDate: string;
  dailyData: Array<{
    date: string;
    consumed: number;
    goal: number;
    withinGoal: boolean;
  }>;
  averageConsumed: number;
  daysWithinGoal: number;
  daysAboveGoal: number;
}

export interface NutritionEstimate {
  foodName: string;
  caloriesPer100g: number;
  proteinPer100g: number;
  carbsPer100g: number;
  fatPer100g: number;
  fiberPer100g: number;
  defaultServingWeightG: number | null;
  confidence: number;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  total: number;
  page: number;
  pageSize: number;
}
