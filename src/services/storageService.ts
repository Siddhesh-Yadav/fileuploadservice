/**
 * Storage Service
 * Handles file storage operations (save, read, delete from disk)
 */

import {
  saveFileBuffer,
  readFileBuffer,
  deleteFileFromDisk,
  fileExistsOnDisk,
  getFileStats,
} from "../utils/fileUploadUtils.js";
import { FileUploadError } from "../errors/FileUploadError.js";
import logger from "../utils/logger.js";

export class StorageService {
  /**
   * Save file buffer to disk
   */
  static async saveFile(buffer: Buffer, filename: string): Promise<string> {
    try {
      const filepath = await saveFileBuffer(buffer, filename);
      logger.info("File saved to disk", { filename, size: buffer.length });
      return filepath;
    } catch (error: any) {
      logger.error("Failed to save file", { error: error.message, filename });
      throw new FileUploadError(`Failed to save file: ${error.message}`);
    }
  }

  /**
   * Read file from disk
   */
  static async readFile(filename: string): Promise<Buffer> {
    try {
      const exists = await fileExistsOnDisk(filename);
      if (!exists) {
        throw new FileUploadError("File not found on disk");
      }

      const buffer = await readFileBuffer(filename);
      logger.info("File read from disk", { filename, size: buffer.length });
      return buffer;
    } catch (error: any) {
      if (error instanceof FileUploadError) {
        throw error;
      }
      logger.error("Failed to read file", { error: error.message, filename });
      throw new FileUploadError(`Failed to read file: ${error.message}`);
    }
  }

  /**
   * Delete file from disk
   */
  static async deleteFile(filename: string): Promise<boolean> {
    try {
      const exists = await fileExistsOnDisk(filename);
      if (!exists) {
        logger.warn("File not found on disk for deletion", { filename });
        return false;
      }

      await deleteFileFromDisk(filename);
      logger.info("File deleted from disk", { filename });
      return true;
    } catch (error: any) {
      logger.error("Failed to delete file", { error: error.message, filename });
      return false;
    }
  }

  /**
   * Get file size
   */
  static async getFileSize(filename: string): Promise<number> {
    try {
      const stats = await getFileStats(filename);
      return stats.size;
    } catch (error: any) {
      logger.error("Failed to get file size", {
        error: error.message,
        filename,
      });
      throw new FileUploadError("Failed to get file size");
    }
  }

  /**
   * Check if file exists
   */
  static async fileExists(filename: string): Promise<boolean> {
    return fileExistsOnDisk(filename);
  }
}
