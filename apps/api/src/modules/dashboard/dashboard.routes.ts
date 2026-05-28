import { Router } from "express";
import { authMiddleware } from "../../middleware/auth.middleware.js";
import { getDashboardController, getWeeklySummaryController } from "./dashboard.controller.js";

export const dashboardRouter = Router();

dashboardRouter.use(authMiddleware);

dashboardRouter.get("/", getDashboardController);
dashboardRouter.get("/weekly", getWeeklySummaryController);
