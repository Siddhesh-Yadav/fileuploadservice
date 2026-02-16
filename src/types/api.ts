/**
 * API request and response types
 */

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
  stack?: string;
}

export interface FileUploadResponse {
  id: string;
  filename: string;
  mimetype: string;
  size: number;
  hash: string;
  uploadedAt: string;
}

export interface FileMetadata {
  id: string;
  filename: string;
  mimetype: string;
  size: number;
  hash: string;
  storagePath: string;
  uploadedAt: Date;
  updatedAt: Date;
  expiresAt?: Date;
}

export interface PaginationQuery {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}
