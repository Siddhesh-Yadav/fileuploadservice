import { Router } from "express";
import {
  uploadFile,
  getFile,
  listFiles,
  downloadFile,
  deleteFile,
  getFileStats,
} from "../controllers/fileController.js";
import { uploadSingleFile, handleUploadError } from "../middlewares/fileUpload.js";

const router = Router();

/**
 * POST /api/files
 * Upload a new file
 */
router.post("/", uploadSingleFile, handleUploadError, uploadFile);

/**
 * GET /api/files
 * List all files with pagination
 */
router.get("/", listFiles);

/**
 * GET /api/files/stats
 * Get file statistics
 */
router.get("/stats", getFileStats);

/**
 * GET /api/files/:id
 * Get file metadata
 */
router.get("/:id", getFile);

/**
 * GET /api/files/:id/download
 * Download file
 */
router.get("/:id/download", downloadFile);

/**
 * DELETE /api/files/:id
 * Delete file
 */
router.delete("/:id", deleteFile);

export default router;
