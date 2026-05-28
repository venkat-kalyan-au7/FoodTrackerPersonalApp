import { Response, NextFunction } from "express";
import { z } from "zod";
import { AuthenticatedRequest } from "../../middleware/auth.middleware.js";
import { createUserSupabaseClient } from "../../integrations/supabase/client.js";
import { createError } from "../../middleware/error.middleware.js";

const UpdateProfileSchema = z.object({
  fullName: z.string().min(1).max(100).optional(),
  gender: z.enum(["MALE", "FEMALE", "OTHER"]).nullable().optional(),
  dateOfBirth: z.string().nullable().optional(),
  heightCm: z.number().positive().nullable().optional(),
  weightKg: z.number().positive().nullable().optional(),
  targetWeightKg: z.number().positive().nullable().optional(),
  preferredUnit: z.enum(["GRAMS", "SERVINGS"]).optional(),
});

const CalorieGoalSchema = z.object({
  calorieGoal: z.number().positive().min(100).max(10000),
  effectiveFrom: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

export async function getProfileController(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const client = createUserSupabaseClient(req.userToken!);
    const { data, error } = await client
      .from("profiles")
      .select("*")
      .eq("id", req.userId)
      .single();

    if (error || !data) {
      res.status(404).json({ success: false, error: "Profile not found" });
      return;
    }

    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

export async function updateProfileController(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const updates = UpdateProfileSchema.parse(req.body);
    const client = createUserSupabaseClient(req.userToken!);

    const dbUpdates: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (updates.fullName !== undefined) dbUpdates.full_name = updates.fullName;
    if (updates.gender !== undefined) dbUpdates.gender = updates.gender;
    if (updates.dateOfBirth !== undefined) dbUpdates.date_of_birth = updates.dateOfBirth;
    if (updates.heightCm !== undefined) dbUpdates.height_cm = updates.heightCm;
    if (updates.weightKg !== undefined) dbUpdates.weight_kg = updates.weightKg;
    if (updates.targetWeightKg !== undefined) dbUpdates.target_weight_kg = updates.targetWeightKg;
    if (updates.preferredUnit !== undefined) dbUpdates.preferred_unit = updates.preferredUnit;

    const { data, error } = await client
      .from("profiles")
      .update(dbUpdates)
      .eq("id", req.userId)
      .select()
      .single();

    if (error || !data) {
      throw createError("Failed to update profile", 500);
    }

    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

export async function getCalorieGoalsController(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const client = createUserSupabaseClient(req.userToken!);
    const { data, error } = await client
      .from("calorie_goals")
      .select("*")
      .eq("user_id", req.userId)
      .order("effective_from", { ascending: false });

    if (error) throw createError("Failed to get calorie goals", 500);
    res.json({ success: true, data: data ?? [] });
  } catch (err) {
    next(err);
  }
}

export async function setCalorieGoalController(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { calorieGoal, effectiveFrom } = CalorieGoalSchema.parse(req.body);
    const client = createUserSupabaseClient(req.userToken!);

    // Close the previous active goal
    const yesterday = new Date(effectiveFrom);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split("T")[0];

    await client
      .from("calorie_goals")
      .update({ effective_to: yesterdayStr })
      .eq("user_id", req.userId)
      .is("effective_to", null);

    // Insert new goal
    const { data, error } = await client
      .from("calorie_goals")
      .insert({
        user_id: req.userId,
        calorie_goal: calorieGoal,
        effective_from: effectiveFrom,
      })
      .select()
      .single();

    if (error) throw createError("Failed to set calorie goal", 500);

    // Also update the profile's daily_calorie_goal for quick access
    await client
      .from("profiles")
      .update({ daily_calorie_goal: calorieGoal, updated_at: new Date().toISOString() })
      .eq("id", req.userId);

    res.status(201).json({ success: true, data });
  } catch (err) {
    next(err);
  }
}
