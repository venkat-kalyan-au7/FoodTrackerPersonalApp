import { Router } from "express";
import { authMiddleware } from "../../middleware/auth.middleware.js";
import { normalizeFoodController, extractIngredientsController } from "./ai.controller.js";

export const aiRouter = Router();

aiRouter.use(authMiddleware);

aiRouter.post("/foods/normalize", normalizeFoodController);
aiRouter.post("/recipes/extract-ingredients", extractIngredientsController);
