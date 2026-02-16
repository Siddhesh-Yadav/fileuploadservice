/**
 * Response Formatter
 * Standardized API response formatting
 */

import { Response } from "express";
import { ApiResponse } from "../types/api.js";

/**
 * Send success response
 */
export const sendSuccessResponse = <T>(
  res: Response,
  data: T,
  message: string = "Request successful",
  statusCode: number = 200
): Response => {
  const response: ApiResponse<T> = {
    success: true,
    message,
    data,
  };

  return res.status(statusCode).json(response);
};

/**
 * Send error response
 */
export const sendErrorResponse = (
  res: Response,
  message: string,
  statusCode: number = 500,
  isDev: boolean = false,
  error?: string,
  stack?: string
): Response => {
  const response: ApiResponse = {
    success: false,
    message,
    ...(isDev && { error, stack }),
  };

  return res.status(statusCode).json(response);
};

/**
 * Send paginated response
 */
export const sendPaginatedResponse = <T>(
  res: Response,
  items: T[],
  total: number,
  page: number,
  limit: number,
  message: string = "Request successful",
  statusCode: number = 200
): Response => {
  const totalPages = Math.ceil(total / limit);

  const response = {
    success: true,
    message,
    data: items,
    pagination: {
      total,
      page,
      limit,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    },
  };

  return res.status(statusCode).json(response);
};
