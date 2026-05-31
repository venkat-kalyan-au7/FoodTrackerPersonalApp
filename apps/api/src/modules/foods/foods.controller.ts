import { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "../../middleware/auth.middleware.js";
import { createUserSupabaseClient } from "../../integrations/supabase/client.js";
import {
  searchFoods,
  getFood,
  createUserFood,
  getRecentFoods,
  estimateAndCacheFood,
} from "./foods.service.js";
import {
  FoodSearchQuerySchema,
  CreateManualFoodSchema,
} from "./foods.schemas.js";

export async function searchFoodsController(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { q, limit } = FoodSearchQuerySchema.parse(req.query);
    const client = createUserSupabaseClient(req.userToken!);
    const results = await searchFoods(client, req.userId!, q, limit);
    res.json({ success: true, data: { results } });
  } catch (err) {
    next(err);
  }
}

export async function getFoodController(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const client = createUserSupabaseClient(req.userToken!);
    const food = await getFood(client, req.params.foodId);
    if (!food) {
      res.status(404).json({ success: false, error: "Food not found" });
      return;
    }
    res.json({ success: true, data: food });
  } catch (err) {
    next(err);
  }
}

export async function createManualFoodController(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const data = CreateManualFoodSchema.parse(req.body);
    const client = createUserSupabaseClient(req.userToken!);
    const food = await createUserFood(client, req.userId!, data);
    res.status(201).json({ success: true, data: food });
  } catch (err) {
    next(err);
  }
}

export async function getRecentFoodsController(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const client = createUserSupabaseClient(req.userToken!);
    const foods = await getRecentFoods(client, req.userId!);
    res.json({ success: true, data: foods });
  } catch (err) {
    next(err);
  }
}

export async function estimateFoodController(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const query = (req.body?.query ?? "").toString().trim();
    if (!query) {
      res.status(400).json({ success: false, error: "query is required" });
      return;
    }
    const food = await estimateAndCacheFood(query);
    res.json({ success: true, data: food });
  } catch (err) {
    const appErr = err as { statusCode?: number; isOperational?: boolean; message?: string };
    if (appErr.isOperational && appErr.statusCode) {
      res.status(appErr.statusCode).json({ success: false, error: appErr.message });
      return;
    }
    next(err);
  }
}
