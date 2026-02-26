/**
 * Database model types
 * These are typically auto-generated from Prisma client
 */

import { File as PrismaFile } from "../generated/prisma/client.js";

import { Customer as PrismaCustomer } from "../generated/prisma/client.js";

// Re-export Prisma types for convenience
export type File = PrismaFile;

export type Customer = PrismaCustomer;

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

/**
 * Type for Customer
 */

/**
 * Type for createInput operations for Customer
 */
export interface CreateCustomerInput {
  customerId: string;
  firstName: string;
  lastName: string;
  company: string;
  city: string;
  country: string;
  phone1: string;
  phone2?: string | null;
  email: string;
  subscriptionDate: Date | null;
  website?: string | null;
}
