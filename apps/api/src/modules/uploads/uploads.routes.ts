import { Router } from "express";
import multer from "multer";
import { authMiddleware } from "../../middleware/auth.middleware.js";
import {
  uploadProfileImageController,
  uploadFoodImageController,
  uploadRecipeImageController,
  uploadLogImageController,
} from "./uploads.controller.js";
import { config } from "../../config/index.js";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: config.upload.maxSizeBytes },
});

const router = Router();

router.use(authMiddleware);

router.post("/profile", upload.single("image"), uploadProfileImageController);
router.post("/food", upload.single("image"), uploadFoodImageController);
router.post("/recipe", upload.single("image"), uploadRecipeImageController);
router.post("/log", upload.single("image"), uploadLogImageController);

export default router;
