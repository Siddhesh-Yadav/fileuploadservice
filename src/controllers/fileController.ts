import { Request, Response } from "express";
import { FileService } from "../services/fileService.js";
import { sendSuccessResponse, sendPaginatedResponse } from "../utils/responseFormatter.js";
import { validate, paginationSchema } from "../utils/validators.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { formatFileSize } from "../utils/fileUploadUtils.js";
import logger from "../utils/logger.js";

/**
 * Upload file
 * POST /api/files
 */
export const uploadFile = asyncHandler(
  async (req: Request, res: Response) => {
    if (!req.file) {
      throw new Error("No file provided");
    }

    const fileWithUrl = await FileService.uploadFile(
      req.file.buffer,
      req.file.originalname,
      req.file.mimetype
    );
    
    sendSuccessResponse(
      res,
      fileWithUrl,
      "File uploaded successfully",
      201
    );
  }
);

/**
 * Get file metadata
 * GET /api/files/:id
 */
export const getFile = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };

  const file = await FileService.getFile(id);

  sendSuccessResponse(res, file, "File retrieved successfully");
});

/**
 * List all files with pagination
 * GET /api/files
 */
export const listFiles = asyncHandler(async (req: Request, res: Response) => {
  // Validate query parameters
  const { valid, error, value } = validate(paginationSchema, req.query);

  if (!valid) {
    return sendSuccessResponse(
      res,
      { error },
      "Validation failed",
      400
    );
  }

  const { page, limit } = value;
  const skip = (page - 1) * limit;

  const { files, total } = await FileService.getAllFiles(skip, limit);

  // Format response with pagination
  return sendPaginatedResponse(res, files, total, page, limit);
});

/**
 * Download file
 * GET /api/files/:id/download
 */
export const downloadFile = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params as { id: string };

    const { buffer, filename, mimetype } = await FileService.downloadFile(id);

    // Set response headers
    res.setHeader("Content-Type", mimetype);
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${encodeURIComponent(filename)}"`
    );
    res.setHeader("Content-Length", buffer.length);

    logger.info("File downloaded", {
      fileId: id,
      filename,
      size: formatFileSize(buffer.length),
    });

    res.send(buffer);
  }
);

/**
 * Delete file
 * DELETE /api/files/:id
 */
export const deleteFile = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };

  const deleted = await FileService.deleteFile(id);

  if (deleted) {
    sendSuccessResponse(res, { id }, "File deleted successfully");
  } else {
    throw new Error("Failed to delete file");
  }
});

/**
 * Get file statistics
 * GET /api/files-stats
 */
export const getFileStats = asyncHandler(
  async (req: Request, res: Response) => {
    const stats = await FileService.getFileStats();

    const formattedStats = {
      totalFiles: stats.totalFiles,
      totalStorageUsed: formatFileSize(stats.totalStorageUsed),
      totalStorageUsedBytes: stats.totalStorageUsed,
    };

    sendSuccessResponse(res, formattedStats, "File statistics retrieved");
  }
);

