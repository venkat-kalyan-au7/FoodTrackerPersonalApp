import { SupabaseClient } from "@supabase/supabase-js";
import { Recipe, RecipeIngredient } from "@food-tracker/shared";
import {
  createRecipeWithIngredients,
  getUserRecipes,
  getRecipeById,
  deleteRecipe,
} from "./recipes.repository.js";
import { getFoodById } from "../foods/foods.repository.js";
import { createError } from "../../middleware/error.middleware.js";
import {
  CreateRecipe,
  RecipeCalculation,
  RecipeIngredientInput,
} from "./recipes.schemas.js";
import { getAiService } from "../../integrations/gemini/gemini.service.js";

// Calculate ingredient calories using backend formula
function calcIngredientCalories(caloriesPer100g: number, weightG: number): number {
  return (caloriesPer100g * weightG) / 100;
}

export async function calculateRecipeNutrition(
  client: SupabaseClient,
  data: RecipeCalculation
): Promise<{
  totalCalories: number;
  caloriesPer100g: number | null;
  caloriesPerServing: number | null;
  ingredientDetails: Array<{ foodId: string; name: string; weightG: number; calories: number }>;
}> {
  let totalCalories = 0;
  const ingredientDetails = [];

  for (const ing of data.ingredients) {
    const food = await getFoodById(client, ing.foodId);
    if (!food || !food.caloriesPer100g) {
      throw createError(`Food ${ing.foodId} not found or has no calorie data`, 400);
    }
    const calories = calcIngredientCalories(food.caloriesPer100g, ing.weightG);
    totalCalories += calories;
    ingredientDetails.push({
      foodId: food.id,
      name: food.name,
      weightG: ing.weightG,
      calories,
    });
  }

  const caloriesPer100g = data.finalWeightG
    ? (totalCalories * 100) / data.finalWeightG
    : null;

  const caloriesPerServing = data.servings
    ? totalCalories / data.servings
    : null;

  return { totalCalories, caloriesPer100g, caloriesPerServing, ingredientDetails };
}

export async function createRecipe(
  client: SupabaseClient,
  userId: string,
  data: CreateRecipe
): Promise<Recipe> {
  let totalCalories = 0;
  const processedIngredients = [];

  for (const ing of data.ingredients) {
    const food = await getFoodById(client, ing.foodId);
    if (!food || !food.caloriesPer100g) {
      throw createError(`Food "${ing.foodId}" not found or has no calorie data`, 400);
    }
    const calories = calcIngredientCalories(food.caloriesPer100g, ing.weightG);
    totalCalories += calories;
    processedIngredients.push({
      foodId: ing.foodId,
      ingredientName: food.name,
      quantity: ing.weightG,
      unit: "g",
      weightG: ing.weightG,
      caloriesPer100g: food.caloriesPer100g,
      calories,
    });
  }

  const caloriesPer100g = data.finalWeightG
    ? (totalCalories * 100) / data.finalWeightG
    : undefined;

  const caloriesPerServing = data.servings
    ? totalCalories / data.servings
    : undefined;

  return createRecipeWithIngredients(
    client,
    userId,
    {
      recipeName: data.name,
      description: data.description,
      instructions: data.instructions,
      finalWeightG: data.finalWeightG,
      servings: data.servings,
      totalCalories,
      caloriesPer100g,
      caloriesPerServing,
    },
    processedIngredients
  );
}

export async function listUserRecipes(
  client: SupabaseClient,
  userId: string
): Promise<Recipe[]> {
  return getUserRecipes(client, userId);
}

export async function getRecipeDetail(
  client: SupabaseClient,
  recipeId: string,
  userId: string
): Promise<{ recipe: Recipe; ingredients: RecipeIngredient[] }> {
  const result = await getRecipeById(client, recipeId, userId);
  if (!result) {
    throw createError("Recipe not found or unauthorized", 404);
  }
  return result;
}

export async function removeRecipe(
  client: SupabaseClient,
  recipeId: string,
  userId: string
): Promise<void> {
  const success = await deleteRecipe(client, recipeId, userId);
  if (!success) {
    throw createError("Recipe not found or unauthorized", 404);
  }
}

export async function extractIngredientsFromText(
  text: string,
  useAdvanced = false
): Promise<{
  recipeName?: string;
  ingredients: Array<{ name: string; quantity: number; unit: string }>;
  confidence: number;
}> {
  const aiService = getAiService();
  if (!aiService) {
    throw createError("AI ingredient extraction is not enabled", 503);
  }

  const result = await aiService.extractRecipeIngredients(text, useAdvanced);
  return result;
}
