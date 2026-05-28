import { Router } from "express";
import { authMiddleware } from "../../middleware/auth.middleware.js";
import {
  createRecipeController,
  listRecipesController,
  getRecipeController,
  deleteRecipeController,
  calculateRecipeController,
  extractIngredientsController,
} from "./recipes.controller.js";

export const recipesRouter = Router();

recipesRouter.use(authMiddleware);

recipesRouter.get("/", listRecipesController);
recipesRouter.post("/", createRecipeController);
recipesRouter.post("/calculate", calculateRecipeController);
recipesRouter.post("/extract-ingredients", extractIngredientsController);
recipesRouter.get("/:id", getRecipeController);
recipesRouter.delete("/:id", deleteRecipeController);
