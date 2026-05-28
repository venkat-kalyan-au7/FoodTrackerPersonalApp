import { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "../../middleware/auth.middleware.js";
import { createUserSupabaseClient } from "../../integrations/supabase/client.js";
import { createError } from "../../middleware/error.middleware.js";

export async function getFavouritesController(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const client = createUserSupabaseClient(req.userToken!);
    const { data, error } = await client
      .from("favourites")
      .select("food_id, created_at, foods(*)")
      .eq("user_id", req.userId)
      .order("created_at", { ascending: false });

    if (error) throw createError("Failed to get favourites", 500);

    const result = (data ?? []).map((row) => ({
      id: row.food_id,
      addedAt: row.created_at,
      ...(row.foods as Record<string, unknown>),
    }));

    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

export async function addFavouriteController(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { foodId } = req.params;
    const client = createUserSupabaseClient(req.userToken!);

    const { data, error } = await client
      .from("favourites")
      .insert({ user_id: req.userId, food_id: foodId })
      .select()
      .single();

    if (error) {
      if (error.code === "23505") {
        // Already a favourite
        res.status(409).json({ success: false, error: "Already in favourites" });
        return;
      }
      throw createError("Failed to add favourite", 500);
    }

    res.status(201).json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

export async function removeFavouriteController(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { foodId } = req.params;
    const client = createUserSupabaseClient(req.userToken!);

    const { error } = await client
      .from("favourites")
      .delete()
      .eq("user_id", req.userId)
      .eq("food_id", foodId);

    if (error) throw createError("Failed to remove favourite", 500);

    res.json({ success: true, message: "Removed from favourites" });
  } catch (err) {
    next(err);
  }
}
