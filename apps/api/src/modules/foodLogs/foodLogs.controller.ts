import { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "../../middleware/auth.middleware.js";
import { createUserSupabaseClient } from "../../integrations/supabase/client.js";
import {
  logFood,
  getDailyLogs,
  editFoodLog,
  removeFoodLog,
} from "./foodLogs.service.js";
import {
  CreateFoodLogSchema,
  UpdateFoodLogSchema,
  FoodLogQuerySchema,
} from "./foodLogs.schemas.js";

export async function createFoodLogController(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const data = CreateFoodLogSchema.parse(req.body);
    const client = createUserSupabaseClient(req.userToken!);
    const log = await logFood(client, req.userId!, data);
    res.status(201).json({ success: true, data: log });
  } catch (err) {
    next(err);
  }
}

export async function getFoodLogsController(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { date } = FoodLogQuerySchema.parse(req.query);
    const targetDate = date ?? new Date().toISOString().split("T")[0];
    const client = createUserSupabaseClient(req.userToken!);
    const logs = await getDailyLogs(client, req.userId!, targetDate);
    res.json({ success: true, data: logs });
  } catch (err) {
    next(err);
  }
}

export async function updateFoodLogController(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const data = UpdateFoodLogSchema.parse(req.body);
    const client = createUserSupabaseClient(req.userToken!);
    const updated = await editFoodLog(client, req.userId!, req.params.id, data);
    res.json({ success: true, data: updated });
  } catch (err) {
    next(err);
  }
}

export async function deleteFoodLogController(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const client = createUserSupabaseClient(req.userToken!);
    await removeFoodLog(client, req.userId!, req.params.id);
    res.json({ success: true, message: "Food log deleted" });
  } catch (err) {
    next(err);
  }
}
