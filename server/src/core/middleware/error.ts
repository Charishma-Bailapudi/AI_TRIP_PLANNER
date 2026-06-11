import { Request, Response, NextFunction } from "express";
import { logger } from "../utils/logger";
import { env } from "../config/env";

export interface CustomError extends Error {
  statusCode?: number;
  errors?: unknown[];
}

export const errorHandler = (
  err: CustomError,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  const errors = err.errors || [];

  // Log error details using Winston
  logger.error(`[${statusCode}] - ${message} - Stack: ${err.stack}`);

  res.status(statusCode).json({
    success: false,
    message,
    errors: env.NODE_ENV === "development" ? [...errors, { stack: err.stack }] : errors,
  });
};
