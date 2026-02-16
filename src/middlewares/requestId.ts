/**
 * Request ID Middleware
 * Adds a unique request ID to each request for tracing
 */

import { Request, Response, NextFunction } from "express";
import { randomUUID } from "crypto";

export const requestIdMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const requestId = req.get("x-request-id") || randomUUID();
  
  // Add to request object
  (req as any).id = requestId;

  // Add to response header
  res.setHeader("x-request-id", requestId);

  next();
};
