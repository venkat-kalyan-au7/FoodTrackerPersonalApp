import { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "../../middleware/auth.middleware.js";
import { createUserSupabaseClient } from "../../integrations/supabase/client.js";
import {
  createRecipe,
  listUserRecipes,
  getRecipeDetail,
  removeRecipe,
  calculateRecipeNutrition,
  extractIngredientsFromText,
} from "./recipes.service.js";
import {
  CreateRecipeSchema,
  RecipeCalculationSchema,
  ExtractIngredientsSchema,
} from "./recipes.schemas.js";

export async function createRecipeController(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const data = CreateRecipeSchema.parse(req.body);
    const client = createUserSupabaseClient(req.userToken!);
    const recipe = await createRecipe(client, req.userId!, data);
    res.status(201).json({ success: true, data: recipe });
  } catch (err) {
    next(err);
  }
}

export async function listRecipesController(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const client = createUserSupabaseClient(req.userToken!);
    const recipes = await listUserRecipes(client, req.userId!);
    res.json({ success: true, data: recipes });
  } catch (err) {
    next(err);
  }
}

export async function getRecipeController(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const client = createUserSupabaseClient(req.userToken!);
    const result = await getRecipeDetail(client, req.params.id, req.userId!);
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

export async function deleteRecipeController(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const client = createUserSupabaseClient(req.userToken!);
    await removeRecipe(client, req.params.id, req.userId!);
    res.json({ success: true, message: "Recipe deleted" });
  } catch (err) {
    next(err);
  }
}

export async function calculateRecipeController(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const data = RecipeCalculationSchema.parse(req.body);
    const client = createUserSupabaseClient(req.userToken!);
    const result = await calculateRecipeNutrition(client, data);
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

export async function extractIngredientsController(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { text, useAdvancedModel } = ExtractIngredientsSchema.parse(req.body);
    const result = await extractIngredientsFromText(text, useAdvancedModel);
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}
