import { Request, Response, NextFunction } from "express";
import { validateToken } from "../integrations/supabase/client.js";

export interface AuthenticatedRequest extends Request {
  userId?: string;
  userEmail?: string;
  userToken?: string;
}

export async function authMiddleware(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({ success: false, error: "Unauthorized" });
    return;
  }

  const token = authHeader.slice(7);

  const user = await validateToken(token);
  if (!user) {
    res.status(401).json({ success: false, error: "Invalid or expired token" });
    return;
  }

  req.userId = user.userId;
  req.userEmail = user.email;
  req.userToken = token;
  next();
}
