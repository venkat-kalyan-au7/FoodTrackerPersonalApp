import { Response, NextFunction } from "express";
import { z } from "zod";
import { AuthenticatedRequest } from "../../middleware/auth.middleware.js";
import { getAiService } from "../../integrations/gemini/gemini.service.js";
import { createError } from "../../middleware/error.middleware.js";
import { config } from "../../config/index.js";

const NormalizeFoodSchema = z.object({
  query: z.string().min(1).max(200),
});

const ExtractIngredientsSchema = z.object({
  text: z.string().min(10).max(2000),
  useAdvancedModel: z.boolean().optional().default(false),
});

function ensureAiEnabled(res: Response): boolean {
  if (!config.ai.enabled) {
    res.status(503).json({
      success: false,
      error: "AI features are not enabled on this server",
    });
    return false;
  }
  return true;
}

export async function normalizeFoodController(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!ensureAiEnabled(res)) return;

    const { query } = NormalizeFoodSchema.parse(req.body);
    const aiService = getAiService();
    if (!aiService) throw createError("AI service unavailable", 503);

    const result = await aiService.normalizeFoodName(query);
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
    if (!ensureAiEnabled(res)) return;

    const { text, useAdvancedModel } = ExtractIngredientsSchema.parse(req.body);
    const aiService = getAiService();
    if (!aiService) throw createError("AI service unavailable", 503);

    const result = await aiService.extractRecipeIngredients(text, useAdvancedModel);
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}
