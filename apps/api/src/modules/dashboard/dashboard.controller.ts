import { Response, NextFunction } from "express";
import { z } from "zod";
import { AuthenticatedRequest } from "../../middleware/auth.middleware.js";
import { createUserSupabaseClient } from "../../integrations/supabase/client.js";
import { getDashboardData, getWeeklySummary } from "./dashboard.service.js";

const DateQuerySchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
});

const WeeklyQuerySchema = z.object({
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
});

export async function getDashboardController(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { date } = DateQuerySchema.parse(req.query);
    const targetDate = date ?? new Date().toISOString().split("T")[0];
    const client = createUserSupabaseClient(req.userToken!);
    const data = await getDashboardData(client, req.userId!, targetDate);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

export async function getWeeklySummaryController(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { startDate } = WeeklyQuerySchema.parse(req.query);
    // Default: start of current week (7 days ago)
    const defaultStart = new Date();
    defaultStart.setDate(defaultStart.getDate() - 6);
    const targetStart = startDate ?? defaultStart.toISOString().split("T")[0];
    const client = createUserSupabaseClient(req.userToken!);
    const data = await getWeeklySummary(client, req.userId!, targetStart);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}
