/**
 * File Upload Middleware
 * Multer configuration for handling multipart/form-data
 */

import multer from "multer";
import { storageConfig } from "../config/storage.js";
import { FileUploadError } from "../errors/FileUploadError.js";

// Configure multer for memory storage (we'll save to disk manually)
const upload = multer({
  // Use memory storage to get buffer directly
  storage: multer.memoryStorage(),

  // File size limit
  limits: {
    fileSize: storageConfig.maxFileSize,
  },

  // File filter
  fileFilter: (req, file, cb) => {
    // Validate MIME type
    if (!storageConfig.isValidMimeType(file.mimetype)) {
      cb(
        new FileUploadError(
          `Invalid file type: ${file.mimetype}. Allowed types: ${storageConfig.allowedMimeTypes.join(", ")}`
        )
      );
      return;
    }

    // Validate file extension
    if (!storageConfig.isValidExtension(file.originalname)) {
      cb(
        new FileUploadError(
          `Invalid file extension. Allowed: ${storageConfig.allowedExtensions.join(", ")}`
        )
      );
      return;
    }

    cb(null, true);
  },
});

/**
 * Middleware for handling single file upload
 */
export const uploadSingleFile = upload.single("file");

/**
 * Middleware for handling multiple file uploads
 */
export const uploadMultipleFiles = upload.array("files", 10);

/**
 * Error handler for multer errors
 */
export const handleUploadError = (
  err: any,
  req: any,
  res: any,
  next: any
) => {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      const error = new FileUploadError(
        `File size exceeds maximum limit of ${storageConfig.maxFileSize} bytes`
      );
      return next(error);
    }
    if (err.code === "LIMIT_FILE_COUNT") {
      const error = new FileUploadError("Too many files");
      return next(error);
    }
  } else if (err instanceof FileUploadError) {
    return next(err);
  }

  next(err);
};
