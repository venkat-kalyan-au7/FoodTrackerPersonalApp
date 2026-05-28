import { SupabaseClient } from "@supabase/supabase-js";
import { Recipe, RecipeIngredient } from "@food-tracker/shared";

function mapToRecipe(row: Record<string, unknown>): Recipe {
  return {
    id: row.id as string,
    userId: row.user_id as string,
    foodId: row.food_id as string | null,
    recipeName: row.recipe_name as string,
    description: row.description as string | null,
    instructions: row.instructions as string | null,
    finalWeightG: row.final_weight_g as number | null,
    servings: row.servings as number | null,
    totalCalories: row.total_calories as number,
    caloriesPer100g: row.calories_per_100g as number | null,
    caloriesPerServing: row.calories_per_serving as number | null,
    imagePath: row.image_path as string | null,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

function mapToIngredient(row: Record<string, unknown>): RecipeIngredient {
  return {
    id: row.id as string,
    recipeId: row.recipe_id as string,
    ingredientFoodId: row.ingredient_food_id as string | null,
    ingredientNameSnapshot: row.ingredient_name_snapshot as string,
    quantity: row.quantity as number,
    unit: row.unit as string,
    weightG: row.weight_g as number,
    caloriesPer100gSnapshot: row.calories_per_100g_snapshot as number,
    caloriesSnapshot: row.calories_snapshot as number,
    createdAt: row.created_at as string,
  };
}

export async function createRecipeWithIngredients(
  client: SupabaseClient,
  userId: string,
  recipeData: {
    recipeName: string;
    description?: string;
    instructions?: string;
    finalWeightG?: number;
    servings?: number;
    totalCalories: number;
    caloriesPer100g?: number;
    caloriesPerServing?: number;
  },
  ingredients: Array<{
    foodId?: string;
    ingredientName: string;
    quantity: number;
    unit: string;
    weightG: number;
    caloriesPer100g: number;
    calories: number;
  }>
): Promise<Recipe> {
  // First create a reusable food record for the recipe
  const normalizedName = recipeData.recipeName.toLowerCase().trim();
  const { data: foodRecord, error: foodError } = await client
    .from("foods")
    .insert({
      owner_user_id: userId,
      name: recipeData.recipeName,
      normalized_name: normalizedName,
      description: recipeData.description ?? null,
      food_type: "RECIPE",
      source_type: "USER_RECIPE",
      calories_per_100g: recipeData.caloriesPer100g ?? null,
      is_verified: false,
      requires_variation_warning: false,
    })
    .select()
    .single();

  if (foodError) throw new Error(`Failed to create recipe food: ${foodError.message}`);

  // Create the recipe record
  const { data: recipe, error: recipeError } = await client
    .from("recipes")
    .insert({
      user_id: userId,
      food_id: foodRecord.id,
      recipe_name: recipeData.recipeName,
      description: recipeData.description ?? null,
      instructions: recipeData.instructions ?? null,
      final_weight_g: recipeData.finalWeightG ?? null,
      servings: recipeData.servings ?? null,
      total_calories: recipeData.totalCalories,
      calories_per_100g: recipeData.caloriesPer100g ?? null,
      calories_per_serving: recipeData.caloriesPerServing ?? null,
    })
    .select()
    .single();

  if (recipeError) throw new Error(`Failed to create recipe: ${recipeError.message}`);

  // Insert recipe ingredients
  const ingredientRows = ingredients.map((ing) => ({
    recipe_id: recipe.id,
    ingredient_food_id: ing.foodId ?? null,
    ingredient_name_snapshot: ing.ingredientName,
    quantity: ing.quantity,
    unit: ing.unit,
    weight_g: ing.weightG,
    calories_per_100g_snapshot: ing.caloriesPer100g,
    calories_snapshot: ing.calories,
  }));

  const { error: ingError } = await client
    .from("recipe_ingredients")
    .insert(ingredientRows);

  if (ingError) throw new Error(`Failed to save ingredients: ${ingError.message}`);

  return mapToRecipe(recipe);
}

export async function getUserRecipes(
  client: SupabaseClient,
  userId: string
): Promise<Recipe[]> {
  const { data, error } = await client
    .from("recipes")
    .select("*")
    .eq("user_id", userId)
    .order("updated_at", { ascending: false });

  if (error) throw new Error(`Failed to get recipes: ${error.message}`);
  return (data ?? []).map(mapToRecipe);
}

export async function getRecipeById(
  client: SupabaseClient,
  recipeId: string,
  userId: string
): Promise<{ recipe: Recipe; ingredients: RecipeIngredient[] } | null> {
  const { data: recipe, error } = await client
    .from("recipes")
    .select("*")
    .eq("id", recipeId)
    .eq("user_id", userId)
    .single();

  if (error || !recipe) return null;

  const { data: ingredients } = await client
    .from("recipe_ingredients")
    .select("*")
    .eq("recipe_id", recipeId)
    .order("created_at", { ascending: true });

  return {
    recipe: mapToRecipe(recipe),
    ingredients: (ingredients ?? []).map(mapToIngredient),
  };
}

export async function deleteRecipe(
  client: SupabaseClient,
  recipeId: string,
  userId: string
): Promise<boolean> {
  const { error } = await client
    .from("recipes")
    .delete()
    .eq("id", recipeId)
    .eq("user_id", userId);

  return !error;
}
