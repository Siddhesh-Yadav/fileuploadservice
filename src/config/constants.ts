/**
 * Application-wide constants
 */

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
} as const;

export const ERROR_MESSAGES = {
  // General
  INTERNAL_ERROR: "Something went wrong. Please try again later.",
  NOT_FOUND: "Resource not found.",
  UNAUTHORIZED: "Unauthorized access.",
  FORBIDDEN: "Forbidden.",

  // File upload
  FILE_UPLOAD_FAILED: "File upload failed.",
  FILE_NOT_FOUND: "File not found.",
  INVALID_FILE_TYPE: "Invalid file type.",
  FILE_TOO_LARGE: "File size exceeds maximum limit.",
  FILE_ALREADY_EXISTS: "A file with this hash already exists.",

  // Validation
  VALIDATION_FAILED: "Validation failed.",
  INVALID_REQUEST: "Invalid request.",

  // Database
  DATABASE_ERROR: "Database operation failed.",
} as const;

export const FILE_ERROR_MESSAGES = {
  MISSING_FILE: "No file provided.",
  CORRUPTED: "File is corrupted.",
  ACCESS_DENIED: "Access denied for this file.",
  EXPIRED: "File has expired.",
} as const;

export const LIMITS = {
  // File upload
  MAX_FILE_SIZE: 52428800, // 50MB
  MIN_FILE_SIZE: 1, // 1 byte

  // Pagination
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 100,

  // Request timeout
  REQUEST_TIMEOUT: 30000, // 30 seconds
} as const;

export const ROUTES = {
  API_PREFIX: "/api",
  FILES: "/files",
  HEALTH: "/health",
} as const;
