import { Router } from "express";
import { authMiddleware } from "../../middleware/auth.middleware.js";
import {
  createFoodLogController,
  getFoodLogsController,
  updateFoodLogController,
  deleteFoodLogController,
} from "./foodLogs.controller.js";

export const foodLogsRouter = Router();

foodLogsRouter.use(authMiddleware);

foodLogsRouter.post("/", createFoodLogController);
foodLogsRouter.get("/", getFoodLogsController);
foodLogsRouter.patch("/:id", updateFoodLogController);
foodLogsRouter.delete("/:id", deleteFoodLogController);
