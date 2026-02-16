/**
 * File storage configuration
 */

import path from "path";
import { env } from "./environment.js";

export const storageConfig = {
  // Upload directory
  uploadDir: env.UPLOAD_DIR,

  // Max file size (50MB by default)
  maxFileSize: env.MAX_FILE_SIZE,

  // Allowed file types (MIME types)
  allowedMimeTypes: [
    "image/jpeg",
    "image/png",
    "image/gif",
    "image/webp",
    "application/pdf",
    "text/plain",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/zip",
    "application/x-rar-compressed",
  ],

  // Allowed file extensions
  allowedExtensions: [
    "jpg",
    "jpeg",
    "png",
    "gif",
    "webp",
    "pdf",
    "txt",
    "xls",
    "xlsx",
    "doc",
    "docx",
    "zip",
    "rar",
  ],

  // Get full upload path
  getUploadPath: (filename: string): string => {
    return path.join(env.UPLOAD_DIR, filename);
  },

  /**
   * Validate file extension
   */
  isValidExtension: (filename: string): boolean => {
    const ext = path.extname(filename).toLowerCase().slice(1);
    return storageConfig.allowedExtensions.includes(ext);
  },

  /**
   * Validate MIME type
   */
  isValidMimeType: (mimeType: string): boolean => {
    return storageConfig.allowedMimeTypes.includes(mimeType);
  },
};
