/**
 * Error Handler Middleware
 * Handles all application errors
 */

import { Request, Response, NextFunction } from "express";
import { AppError } from "../errors/AppError.js";
import { ValidationError } from "../errors/ValidationError.js";
import { FileUploadError } from "../errors/FileUploadError.js";
import logger from "../utils/logger.js";
import { env } from "../config/environment.js";
import { HTTP_STATUS, ERROR_MESSAGES } from "../config/constants.js";

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  let statusCode: number = HTTP_STATUS.INTERNAL_SERVER_ERROR;
  let message: string = ERROR_MESSAGES.INTERNAL_ERROR;
  let isOperational = false;
  let details: any = undefined;

  // Handle AppError instances
  if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
    isOperational = err.isOperational;

    // Add validation details if present
    if (err instanceof ValidationError && err.details) {
      details = err.details;
    }
  } else if (err instanceof SyntaxError) {
    statusCode = HTTP_STATUS.BAD_REQUEST;
    message = "Invalid JSON in request body";
    isOperational = true;
  } else if (err?.code === "LIMIT_FILE_SIZE") {
    statusCode = HTTP_STATUS.BAD_REQUEST;
    message = "File size too large";
    isOperational = true;
  } else if (err?.message) {
    message = err.message;
    isOperational = false;
  }

  // Log appropriately
  const logData = {
    message,
    statusCode,
    path: req.originalUrl,
    method: req.method,
    ip: req.ip,
    userAgent: req.get("user-agent"),
  };

  if (isOperational || statusCode < HTTP_STATUS.INTERNAL_SERVER_ERROR) {
    logger.warn("Operational error", logData);
  } else {
    logger.error("Unhandled error", {
      ...logData,
      stack: err?.stack,
      body: req.body,
      error: err,
    });
  }

  // Send response
  res.status(statusCode).json({
    success: false,
    message,
    ...(details && { details }),
    // Only show error details in development
    ...(env.isDevelopment && { error: err?.message, stack: err?.stack }),
  });
};

/**
 * 404 Handler Middleware
 */
export const notFoundHandler = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Check for suspicious patterns
  const suspiciousPatterns = [
    "/Index/",
    "invokefunction",
    "call_user_func",
    "system(",
    "eval(",
    "/wp-admin",
    "/phpMyAdmin",
    ".env",
    ".git",
    "union select",
    "base64_decode",
  ];

  const isSuspicious = suspiciousPatterns.some((pattern) =>
    req.originalUrl.toLowerCase().includes(pattern.toLowerCase())
  );

  if (isSuspicious) {
    logger.warn("Suspicious request blocked", {
      path: req.originalUrl,
      method: req.method,
      ip: req.ip,
      userAgent: req.get("user-agent"),
    });
  } else {
    logger.info("Route not found", {
      path: req.originalUrl,
      method: req.method,
      ip: req.ip,
    });
  }

  res.status(HTTP_STATUS.NOT_FOUND).json({
    success: false,
    message: "Route not found",
  });
};
