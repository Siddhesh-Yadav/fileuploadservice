/**
 * File Service
 * Business logic for file upload operations
 */

import fs from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";

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
  static async uploadFile(buffer: Buffer, originalname: string, mimetype: string) {
    const uploadsDir = path.join(process.cwd(), "src/uploads");
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    // ensure a new file every upload
    const filename = `${uuidv4()}-${originalname}`;
    const filePath = path.join(uploadsDir, filename);

    await fs.promises.writeFile(filePath, buffer);

    return {
      filename,
      storagePath: filePath,
      mimetype,
      size: buffer.length,
    };
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
