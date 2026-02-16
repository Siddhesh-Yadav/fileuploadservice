/**
 * Winston Logger Configuration
 */

import winston from "winston";
import { env } from "../config/environment.js";

const logger = winston.createLogger({
  level: env.LOG_LEVEL,
  format: winston.format.combine(
    winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    winston.format.errors({ stack: true }),
    winston.format.printf(({ level, message, timestamp, stack, ...meta }) => {
      const metaStr = Object.keys(meta).length
        ? JSON.stringify(meta)
        : "";
      return `[${timestamp}] [${level.toUpperCase()}]: ${stack || message} ${metaStr}`;
    })
  ),
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      ),
    }),
  ],
});

// Add file transports in production
if (env.isProduction) {
  logger.add(
    new winston.transports.File({
      filename: "logs/error.log",
      level: "error",
    })
  );
  logger.add(
    new winston.transports.File({
      filename: "logs/combined.log",
    })
  );
}

export default logger;
