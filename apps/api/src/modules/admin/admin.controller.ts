import { Response, NextFunction } from "express";
import { z } from "zod";
import { AuthenticatedRequest } from "../../middleware/auth.middleware.js";
import { getAdminSupabaseClient } from "../../integrations/supabase/client.js";
import { createError } from "../../middleware/error.middleware.js";
import { config } from "../../config/index.js";

const InviteUserSchema = z.object({
  email: z.string().email(),
});

const UpdateUserStatusSchema = z.object({
  isActive: z.boolean(),
});

export async function inviteUserController(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { email } = InviteUserSchema.parse(req.body);
    const adminClient = getAdminSupabaseClient();

    // Check for duplicate active invitation
    const { data: existing } = await adminClient
      .from("invitations_audit")
      .select("id, status")
      .eq("invited_email", email)
      .in("status", ["PENDING", "ACCEPTED"])
      .limit(1);

    if (existing && existing.length > 0) {
      res.status(409).json({
        success: false,
        error: "An active invitation already exists for this email",
      });
      return;
    }

    // Send Supabase invite
    const { data, error } = await adminClient.auth.admin.inviteUserByEmail(email, {
      redirectTo: `${process.env.FRONTEND_URL}/set-password`,
    });
    if (error) throw createError(`Failed to invite user: ${error.message}`, 400);

    // Record in audit table
    await adminClient.from("invitations_audit").insert({
      invited_email: email,
      invited_by_user_id: req.userId,
      status: "PENDING",
    });

    res.status(201).json({ success: true, data: { email, message: "Invitation sent" } });
  } catch (err) {
    next(err);
  }
}

export async function getInvitationsController(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const adminClient = getAdminSupabaseClient();
    const { data, error } = await adminClient
      .from("invitations_audit")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw createError("Failed to get invitations", 500);
    res.json({ success: true, data: data ?? [] });
  } catch (err) {
    next(err);
  }
}

export async function updateUserStatusController(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { userId } = req.params;
    const { isActive } = UpdateUserStatusSchema.parse(req.body);
    const adminClient = getAdminSupabaseClient();

    const { data, error } = await adminClient
      .from("profiles")
      .update({ is_active: isActive, updated_at: new Date().toISOString() })
      .eq("id", userId)
      .select()
      .single();

    if (error || !data) throw createError("User not found", 404);

    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

export async function getAiStatsController(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const adminClient = getAdminSupabaseClient();

    // Count cached foods per source type
    const [aiCount, usdaCount, offCount, ninjaCount, totalFoodsCount] = await Promise.all([
      adminClient
        .from("foods")
        .select("id", { count: "exact", head: true })
        .eq("food_type", "EXTERNAL")
        .like("source_reference_id", "ai:%")
        .is("owner_user_id", null),
      adminClient
        .from("foods")
        .select("id", { count: "exact", head: true })
        .eq("source_type", "USDA_FDC")
        .is("owner_user_id", null),
      adminClient
        .from("foods")
        .select("id", { count: "exact", head: true })
        .eq("source_type", "OPEN_FOOD_FACTS")
        .is("owner_user_id", null),
      adminClient
        .from("foods")
        .select("id", { count: "exact", head: true })
        .eq("source_type", "CALORIE_NINJA")
        .is("owner_user_id", null),
      adminClient
        .from("foods")
        .select("id", { count: "exact", head: true })
        .is("owner_user_id", null),
    ]);

    // Gemini free-tier daily limits per known model
    const modelLimits: Record<string, number> = {
      "gemini-2.0-flash-lite": 1500,
      "gemini-2.0-flash": 1500,
      "gemini-1.5-flash": 1500,
      "gemini-2.5-flash-lite": 20,
      "gemini-2.5-flash": 25,
    };
    const currentModel = config.ai.model;
    const dailyLimit = modelLimits[currentModel] ?? null;

    res.json({
      success: true,
      data: {
        sources: {
          aiEstimates:    { cached: aiCount.count ?? 0,    keyConfigured: !!config.ai.geminiApiKey },
          usda:           { cached: usdaCount.count ?? 0,  keyConfigured: !!config.usda.apiKey },
          openFoodFacts:  { cached: offCount.count ?? 0,   keyConfigured: true }, // no key needed
          calorieNinja:   { cached: ninjaCount.count ?? 0, keyConfigured: !!config.calorieNinja.apiKey },
        },
        totalCachedFoods: totalFoodsCount.count ?? 0,
        gemini: {
          model: currentModel,
          freeTierDailyLimit: dailyLimit,
          keyConfigured: !!config.ai.geminiApiKey,
          note: dailyLimit
            ? `Each unique food is estimated once and cached — repeat searches use 0 quota.`
            : "Unknown model — check AI_MODEL env var.",
        },
      },
    });
  } catch (err) {
    next(err);
  }
}
