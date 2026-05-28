import { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import { config } from "../config/index.js";

export interface AppError extends Error {
  statusCode?: number;
  isOperational?: boolean;
}

export function createError(message: string, statusCode: number): AppError {
  const error: AppError = new Error(message);
  error.statusCode = statusCode;
  error.isOperational = true;
  return error;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorMiddleware(
  err: AppError | ZodError | Error,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  if (err instanceof ZodError) {
    res.status(400).json({
      success: false,
      error: "Validation error",
      details: err.errors,
    });
    return;
  }

  const statusCode = (err as AppError).statusCode ?? 500;
  const message =
    (err as AppError).isOperational
      ? err.message
      : config.isDevelopment()
      ? err.message
      : "Internal server error";

  if (!config.isDevelopment() && statusCode === 500) {
    console.error("Unhandled error:", err);
  }

  res.status(statusCode).json({
    success: false,
    error: message,
  });
}
