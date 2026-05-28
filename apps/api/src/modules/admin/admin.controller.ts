import { Response, NextFunction } from "express";
import { z } from "zod";
import { AuthenticatedRequest } from "../../middleware/auth.middleware.js";
import { getAdminSupabaseClient } from "../../integrations/supabase/client.js";
import { createError } from "../../middleware/error.middleware.js";

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
    const { data, error } = await adminClient.auth.admin.inviteUserByEmail(email);
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
