/**
 * File Repository
 * Data access layer for file operations
 */

import prisma from "../config/database.js";
import { CreateFileInput, File } from "../types/models.js";

export class FileRepository {
  /**
   * Create a new file record
   */
  static async create(data: CreateFileInput): Promise<File> {
    return prisma.file.create({
      data,
    });
  }

  /**
   * Find file by ID
   */
  static async findById(id: string): Promise<File | null> {
    return prisma.file.findUnique({
      where: { id },
    });
  }


  /**
   * Get all files with pagination
   */
  static async findAll(
    skip: number = 0,
    take: number = 10
  ): Promise<{ files: File[]; total: number }> {
    const [files, total] = await Promise.all([
      prisma.file.findMany({
        skip,
        take,
        orderBy: {
          uploadedAt: "desc",
        },
      }),
      prisma.file.count(),
    ]);

    return { files, total };
  }

  /**
   * Update file record
   */
  static async update(
    id: string,
    data: Partial<CreateFileInput>
  ): Promise<File | null> {
    try {
      return await prisma.file.update({
        where: { id },
        data,
      });
    } catch (error) {
      return null;
    }
  }

  /**
   * Delete file record
   */
  static async delete(id: string): Promise<boolean> {
    try {
      await prisma.file.delete({
        where: { id },
      });
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Delete expired files (cleanup job)
   */
  static async deleteExpired(): Promise<number> {
    const result = await prisma.file.deleteMany({
      where: {
        expiresAt: {
          lt: new Date(),
        },
      },
    });
    return result.count;
  }

  /**
   * Get file count
   */
  static async count(): Promise<number> {
    return prisma.file.count();
  }

  /**
   * Get total storage used in bytes
   */
  static async getTotalStorageUsed(): Promise<number> {
    const result = await prisma.file.aggregate({
      _sum: {
        size: true,
      },
    });
    return result._sum.size || 0;
  }
}
