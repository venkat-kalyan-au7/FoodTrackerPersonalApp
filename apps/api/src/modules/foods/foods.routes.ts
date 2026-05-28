import { Router } from "express";
import { authMiddleware } from "../../middleware/auth.middleware.js";
import {
  searchFoodsController,
  getFoodController,
  createManualFoodController,
  getRecentFoodsController,
  estimateFoodController,
} from "./foods.controller.js";

export const foodsRouter = Router();

foodsRouter.use(authMiddleware);

foodsRouter.get("/search", searchFoodsController);
foodsRouter.get("/recent", getRecentFoodsController);
foodsRouter.post("/estimate", estimateFoodController);
foodsRouter.get("/:foodId", getFoodController);
foodsRouter.post("/manual", createManualFoodController);
