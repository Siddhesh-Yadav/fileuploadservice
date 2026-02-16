/**
 * Database model types
 * These are typically auto-generated from Prisma client
 */

import { File as PrismaFile } from "../generated/prisma/client.js";

// Re-export Prisma types for convenience
export type File = PrismaFile;

/**
 * Type for createInput operations
 */
export interface CreateFileInput {
  filename: string;
  mimetype: string;
  size: number;
  hash: string;
  storagePath: string;
  expiresAt?: Date;
}

/**
 * Type for file query results
 */
export interface FileWithUrl extends File {
  downloadUrl?: string;
}
