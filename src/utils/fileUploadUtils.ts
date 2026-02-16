/**
 * File Upload Utilities
 * Helper functions for file operations
 */

import crypto from "crypto";
import path from "path";
import fs from "fs/promises";
import { storageConfig } from "../config/storage.js";

/**
 * Generate SHA-256 hash of file buffer
 */
export const generateFileHash = (buffer: Buffer): string => {
  return crypto.createHash("sha256").update(buffer).digest("hex");
};

/**
 * Generate safe filename with timestamp and random hash
 */
export const generateSafeFilename = (originalName: string): string => {
  const timestamp = Date.now();
  const random = crypto.randomBytes(4).toString("hex");
  const ext = path.extname(originalName);
  const nameWithoutExt = path.basename(originalName, ext);

  return `${nameWithoutExt}-${timestamp}-${random}${ext}`;
};

/**
 * Get file extension from filename
 */
export const getFileExtension = (filename: string): string => {
  return path.extname(filename).toLowerCase().slice(1);
};

/**
 * Validate file MIME type
 */
export const isValidFileMimeType = (mimeType: string): boolean => {
  return storageConfig.isValidMimeType(mimeType);
};

/**
 * Validate file extension
 */
export const isValidFileExtension = (filename: string): boolean => {
  return storageConfig.isValidExtension(filename);
};

/**
 * Save file buffer to disk
 */
export const saveFileBuffer = async (
  buffer: Buffer,
  filename: string
): Promise<string> => {
  const filepath = storageConfig.getUploadPath(filename);

  // Ensure upload directory exists
  await fs.mkdir(storageConfig.uploadDir, { recursive: true });

  // Write file
  await fs.writeFile(filepath, buffer);

  return filepath;
};

/**
 * Read file buffer from disk
 */
export const readFileBuffer = async (filename: string): Promise<Buffer> => {
  const filepath = storageConfig.getUploadPath(filename);
  return fs.readFile(filepath);
};

/**
 * Delete file from disk
 */
export const deleteFileFromDisk = async (filename: string): Promise<void> => {
  const filepath = storageConfig.getUploadPath(filename);
  try {
    await fs.unlink(filepath);
  } catch (error: any) {
    if (error.code !== "ENOENT") {
      throw error;
    }
    // File doesn't exist, ignore
  }
};

/**
 * Check if file exists on disk
 */
export const fileExistsOnDisk = async (filename: string): Promise<boolean> => {
  const filepath = storageConfig.getUploadPath(filename);
  try {
    await fs.access(filepath);
    return true;
  } catch {
    return false;
  }
};

/**
 * Get file stats (size, created date, etc.)
 */
export const getFileStats = async (filename: string) => {
  const filepath = storageConfig.getUploadPath(filename);
  return fs.stat(filepath);
};

/**
 * Format file size for display
 */
export const formatFileSize = (bytes: number): string => {
  const units = ["B", "KB", "MB", "GB"];
  let size = bytes;
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }

  return `${size.toFixed(2)} ${units[unitIndex]}`;
};
