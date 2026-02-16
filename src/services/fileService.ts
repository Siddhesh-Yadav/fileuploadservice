/**
 * File Service
 * Business logic for file upload operations
 */

import { FileRepository } from "../repositories/fileRepository.js";
import { StorageService } from "./storageService.js";
import {
  generateFileHash,
  generateSafeFilename,
  getFileExtension,
  isValidFileMimeType,
  isValidFileExtension,
} from "../utils/fileUploadUtils.js";
import { ValidationError } from "../errors/ValidationError.js";
import { FileUploadError } from "../errors/FileUploadError.js";
import { NotFoundError } from "../errors/NotFoundError.js";
import { storageConfig } from "../config/storage.js";
import logger from "../utils/logger.js";
import { File, FileWithUrl } from "../types/models.js";

export class FileService {
  /**
   * Upload a new file
   */
  static async uploadFile(
    buffer: Buffer,
    originalFilename: string,
    mimetype: string
  ): Promise<FileWithUrl> {
    // Validate file
    this.validateFile(buffer, originalFilename, mimetype);

    // Generate hash for deduplication
    const hash = generateFileHash(buffer);

    // Check if file already exists
    const existingFile = await FileRepository.findByHash(hash);
    if (existingFile) {
      logger.info("File already exists (duplicate detected)", {
        hash,
        existingId: existingFile.id,
      });
      return {
        ...existingFile,
        downloadUrl: `/api/files/${existingFile.id}/download`,
      };
    }

    // Generate safe filename
    const safeFilename = generateSafeFilename(originalFilename);

    try {
      // Save file to disk
      const storagePath = await StorageService.saveFile(buffer, safeFilename);

      // Save metadata to database
      const file = await FileRepository.create({
        filename: originalFilename,
        mimetype,
        size: buffer.length,
        hash,
        storagePath: safeFilename, // Store only the safe filename, not full path
      });

      logger.info("File uploaded successfully", {
        fileId: file.id,
        filename: originalFilename,
        size: buffer.length,
      });

      return {
        ...file,
        downloadUrl: `/api/files/${file.id}/download`,
      };
    } catch (error: any) {
      logger.error("File upload failed", {
        error: error.message,
        filename: originalFilename,
      });
      throw error;
    }
  }

  /**
   * Get file by ID
   */
  static async getFile(fileId: string): Promise<FileWithUrl> {
    const file = await FileRepository.findById(fileId);
    if (!file) {
      throw new NotFoundError("File");
    }

    return {
      ...file,
      downloadUrl: `/api/files/${file.id}/download`,
    };
  }

  /**
   * Get all files with pagination
   */
  static async getAllFiles(
    skip: number = 0,
    take: number = 10
  ): Promise<{ files: FileWithUrl[]; total: number }> {
    const { files, total } = await FileRepository.findAll(skip, take);

    const filesWithUrl = files.map((file) => ({
      ...file,
      downloadUrl: `/api/files/${file.id}/download`,
    }));

    return { files: filesWithUrl, total };
  }

  /**
   * Download file (get file content)
   */
  static async downloadFile(fileId: string): Promise<{
    buffer: Buffer;
    filename: string;
    mimetype: string;
  }> {
    const file = await FileRepository.findById(fileId);
    if (!file) {
      throw new NotFoundError("File");
    }

    // Check if file exists on disk
    const exists = await StorageService.fileExists(file.storagePath);
    if (!exists) {
      logger.error("File metadata exists but file not found on disk", {
        fileId,
        storagePath: file.storagePath,
      });
      throw new FileUploadError("File not found on disk");
    }

    // Read file from disk
    const buffer = await StorageService.readFile(file.storagePath);

    return {
      buffer,
      filename: file.filename,
      mimetype: file.mimetype,
    };
  }

  /**
   * Delete file
   */
  static async deleteFile(fileId: string): Promise<boolean> {
    const file = await FileRepository.findById(fileId);
    if (!file) {
      throw new NotFoundError("File");
    }

    // Delete from disk
    await StorageService.deleteFile(file.storagePath);

    // Delete from database
    const deleted = await FileRepository.delete(fileId);

    if (deleted) {
      logger.info("File deleted successfully", {
        fileId,
        filename: file.filename,
      });
    }

    return deleted;
  }

  /**
   * Get file statistics
   */
  static async getFileStats(): Promise<{
    totalFiles: number;
    totalStorageUsed: number;
  }> {
    const totalFiles = await FileRepository.count();
    const totalStorageUsed = await FileRepository.getTotalStorageUsed();

    return { totalFiles, totalStorageUsed };
  }

  /**
   * Validate file before upload
   */
  private static validateFile(
    buffer: Buffer,
    filename: string,
    mimetype: string
  ): void {
    // Check file size
    if (buffer.length > storageConfig.maxFileSize) {
      throw new ValidationError(
        `File size exceeds maximum limit of ${storageConfig.maxFileSize} bytes`
      );
    }

    if (buffer.length === 0) {
      throw new ValidationError("File cannot be empty");
    }

    // Check file extension
    if (!isValidFileExtension(filename)) {
      throw new ValidationError(
        `Invalid file extension. Allowed extensions: ${storageConfig.allowedExtensions.join(", ")}`
      );
    }

    // Check MIME type
    if (!isValidFileMimeType(mimetype)) {
      throw new ValidationError(
        `Invalid file type. Allowed types: ${storageConfig.allowedMimeTypes.join(", ")}`
      );
    }
  }
}
