import { Router } from "express";
import { authMiddleware } from "../../middleware/auth.middleware.js";
import { adminMiddleware } from "../../middleware/admin.middleware.js";
import {
  inviteUserController,
  getInvitationsController,
  updateUserStatusController,
} from "./admin.controller.js";

export const adminRouter = Router();

adminRouter.use(authMiddleware);
adminRouter.use(adminMiddleware);

adminRouter.post("/invitations", inviteUserController);
adminRouter.get("/invitations", getInvitationsController);
adminRouter.patch("/users/:userId/status", updateUserStatusController);
