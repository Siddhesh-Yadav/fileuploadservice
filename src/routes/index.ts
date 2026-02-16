/**
 * Router Configuration
 * Aggregates all routes
 */

import { Router } from "express";
import filesRouter from "./files.js";
import healthRouter from "./health.js";

const router = Router();

/**
 * Health check routes
 */
router.use("/health", healthRouter);

/**
 * API routes
 */
router.use("/files", filesRouter);

/**
 * Root endpoint
 */
router.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "File Upload Service API",
    version: "1.0.0",
    endpoints: {
      health: "/health",
      files: {
        upload: "POST /files",
        list: "GET /files",
        get: "GET /files/:id",
        download: "GET /files/:id/download",
        delete: "DELETE /files/:id",
        stats: "GET /files/stats",
      },
    },
  });
});

export default router;
