import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";

import { config } from "./config/index.js";
import { errorMiddleware } from "./middleware/error.middleware.js";

import { foodsRouter } from "./modules/foods/foods.routes.js";
import { foodLogsRouter } from "./modules/foodLogs/foodLogs.routes.js";
import { recipesRouter } from "./modules/recipes/recipes.routes.js";
import { dashboardRouter } from "./modules/dashboard/dashboard.routes.js";
import { profileRouter } from "./modules/profile/profile.routes.js";
import { favouritesRouter } from "./modules/favourites/favourites.routes.js";
import { adminRouter } from "./modules/admin/admin.routes.js";
import { aiRouter } from "./modules/ai/ai.routes.js";
import uploadsRouter from "./modules/uploads/uploads.routes.js";

const app = express();

// Trust reverse proxy (Koyeb / any cloud platform) so that
// express-rate-limit and req.ip see the real client IP, not the proxy IP.
app.set("trust proxy", 1);

// Security headers
app.use(helmet());

// CORS
app.use(
  cors({
    origin: config.frontendUrl,
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 500,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: "Too many requests, please try again later" },
});
app.use(limiter);

// Body parsing
app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ extended: true }));

// Logging in development
if (config.isDevelopment()) {
  app.use(morgan("dev"));
}

// Health check
app.get("/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Routes
app.use("/api/foods", foodsRouter);
app.use("/api/food-logs", foodLogsRouter);
app.use("/api/recipes", recipesRouter);
app.use("/api/dashboard", dashboardRouter);
app.use("/api/profile", profileRouter);
app.use("/api/favourites", favouritesRouter);
app.use("/api/admin", adminRouter);
app.use("/api/ai", aiRouter);
app.use("/api/uploads", uploadsRouter);

// 404 handler
app.use((_req, res) => {
  res.status(404).json({ success: false, error: "Endpoint not found" });
});

// Global error handler
app.use(errorMiddleware);

export { app };
