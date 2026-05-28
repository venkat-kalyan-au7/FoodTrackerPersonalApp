import { Router } from "express";
import { authMiddleware } from "../../middleware/auth.middleware.js";
import {
  getProfileController,
  updateProfileController,
  getCalorieGoalsController,
  setCalorieGoalController,
} from "./profile.controller.js";

export const profileRouter = Router();

profileRouter.use(authMiddleware);

profileRouter.get("/", getProfileController);
profileRouter.patch("/", updateProfileController);
profileRouter.get("/calorie-goals", getCalorieGoalsController);
profileRouter.post("/calorie-goals", setCalorieGoalController);
