/**
 * Application Entry Point
 * Server initialization and configuration
 */

import "dotenv/config";
import express, { Express } from "express";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import cors from "cors";

import { env, validateEnvironment } from "./config/environment.js";
import { disconnectDatabase } from "./config/database.js";
import routes from "./routes/index.js";
import logger from "./utils/logger.js";
import { requestLogger } from "./utils/requestLogger.js";
import { requestIdMiddleware } from "./middlewares/requestId.js";
import { errorHandler, notFoundHandler } from "./middlewares/errorHandler.js";

// Initialize Express app
const app: Express = express();

/**
 * Global error handlers for unhandled Promise rejections
 */
process.on("uncaughtException", (err) => {
  logger.error("UNCAUGHT EXCEPTION - Shutting down server", {
    error: err.message,
    stack: err.stack,
  });
  process.exit(1);
});

process.on("unhandledRejection", (reason) => {
  logger.error("UNHANDLED REJECTION - Shutting down server", {
    reason: reason instanceof Error ? reason.message : String(reason),
  });
  process.exit(1);
});

/**
 * Middleware Configuration
 * Order matters!
 */

// 1. Body parsing middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// 2. Security middleware
app.use(helmet()); // Security headers
app.use(
  cors({
    origin: env.isDevelopment ? "*" : "http://localhost:3000",
    credentials: true,
  })
);

// 3. Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP, please try again later.",
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});
app.use(limiter);

// 4. Logging and tracking middleware
app.use(requestIdMiddleware);
app.use(requestLogger);

// 5. Routes
app.use("/api", routes);

// 6. 404 handler (must come before error handler)
app.use(notFoundHandler);

// 7. Error handler (must be last)
app.use(errorHandler);

/**
 * Graceful Shutdown Handler
 */
const gracefulShutdown = async (signal: string) => {
  logger.info(`${signal} received. Shutting down gracefully...`);

  // Close database connection
  await disconnectDatabase();

  // Close server
  if (server) {
    server.close(() => {
      logger.info("Server shut down successfully");
      process.exit(0);
    });

    // Force shutdown after 10 seconds
    setTimeout(() => {
      logger.error("Forced shutdown after timeout");
      process.exit(1);
    }, 10000);
  }
};

process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));

/**
 * Server Initialization
 */
let server: any;

const startServer = async () => {
  try {
    // Validate environment variables
    validateEnvironment();

    // Start listening
    server = app.listen(env.PORT, () => {
      logger.info(`✓ Server started successfully`, {
        port: env.PORT,
        environment: env.NODE_ENV,
      });
      logger.info(`✓ API available at http://localhost:${env.PORT}/api`, {});
      logger.info(`✓ Health check: http://localhost:${env.PORT}/api/health`, {
      });
    });
  } catch (error: any) {
    logger.error("Failed to start server", {
      error: error.message,
      stack: error.stack,
    });
    process.exit(1);
  }
};

// Start the server
startServer();

export default app;
