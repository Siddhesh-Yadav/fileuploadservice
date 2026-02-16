/**
 * Health Check Routes
 * Simple health check and status endpoints
 */

import { Router, Request, Response } from "express";

const router = Router();

/**
 * GET /health
 * Simple health check
 */
router.get("/", (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: "Server is running",
    timestamp: new Date().toISOString(),
  });
});

/**
 * GET /health/status
 * Detailed health status
 */
router.get("/status", (req: Request, res: Response) => {
  const uptime = process.uptime();
  const memoryUsage = process.memoryUsage();

  res.status(200).json({
    success: true,
    message: "Server status",
    data: {
      uptime: `${Math.floor(uptime / 60)} minutes ${Math.floor(uptime % 60)} seconds`,
      memory: {
        rss: `${Math.round(memoryUsage.rss / 1024 / 1024)} MB`,
        heapTotal: `${Math.round(memoryUsage.heapTotal / 1024 / 1024)} MB`,
        heapUsed: `${Math.round(memoryUsage.heapUsed / 1024 / 1024)} MB`,
        external: `${Math.round(memoryUsage.external / 1024 / 1024)} MB`,
      },
    },
    timestamp: new Date().toISOString(),
  });
});

export default router;
