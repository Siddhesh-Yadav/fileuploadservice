/**
 * Environment configuration with validation
 */

const getEnv = (key: string, defaultValue?: string): string => {
  const value = process.env[key];
  if (!value && defaultValue === undefined) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value || defaultValue!;
};

export const env = {
  // Server
  PORT: parseInt(getEnv("PORT", "3000")),
  NODE_ENV: getEnv("NODE_ENV", "development"),
  isDevelopment: getEnv("NODE_ENV", "development") === "development",
  isProduction: getEnv("NODE_ENV", "development") === "production",

  // Database
  DATABASE_URL: getEnv("DATABASE_URL"),

  // File upload
  MAX_FILE_SIZE: parseInt(getEnv("MAX_FILE_SIZE", "52428800")), // 50MB in bytes
  UPLOAD_DIR: getEnv("UPLOAD_DIR", "./src/uploads"),

  // Logging
  LOG_LEVEL: getEnv("LOG_LEVEL", "debug"),
};

/**
 * Validate environment on startup
 */
export const validateEnvironment = () => {
  try {
    // Access all env vars to trigger validation
    Object.values(env);
    console.log("✓ Environment variables validated");
  } catch (error) {
    console.error("✗ Environment validation failed:", error);
    process.exit(1);
  }
};
