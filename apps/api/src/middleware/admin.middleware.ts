import { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "./auth.middleware.js";
import { getAdminSupabaseClient } from "../integrations/supabase/client.js";

export async function adminMiddleware(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  if (!req.userId) {
    res.status(401).json({ success: false, error: "Unauthorized" });
    return;
  }

  try {
    const adminClient = getAdminSupabaseClient();
    const { data, error } = await adminClient
      .from("profiles")
      .select("role")
      .eq("id", req.userId)
      .single();

    if (error || !data) {
      res.status(403).json({ success: false, error: "Forbidden" });
      return;
    }

    if (data.role !== "ADMIN") {
      res.status(403).json({ success: false, error: "Admin access required" });
      return;
    }

    next();
  } catch (err) {
    res.status(500).json({ success: false, error: "Internal server error" });
  }
}
