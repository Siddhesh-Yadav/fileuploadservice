/**
 * Async Handler Wrapper
 * Wraps async route handlers to catch errors and pass to error middleware
 */

import { Request, Response, NextFunction } from "express";
import { AppError } from "../errors/AppError.js";

export type AsyncRouteHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<any>;

/**
 * Wraps async route handlers to catch promises rejections
 * @param fn - The async route handler
 * @returns Wrapped handler that catches errors
 */
export const asyncHandler = (fn: AsyncRouteHandler) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
