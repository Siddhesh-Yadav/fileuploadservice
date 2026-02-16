/**
 * Prisma database client configuration
 * Updated for Prisma 7 with MariaDB/MySQL Adapter
 */
import { PrismaClient } from "../generated/prisma/client.js";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import mariadb, { PoolConfig } from "mariadb";
import { env } from "./environment.js";

// 1. Initialize the connection pool using your environment variable
const pool  = mariadb.createPool(process.env.DATABASE_URL as string);
const adapter = new PrismaMariaDb(pool as unknown as PoolConfig);

let prisma: PrismaClient;

const clientOptions = {
  adapter, // Pass the adapter here for Prisma 7
  log: env.isDevelopment ? ["query", "error", "warn"] : ["error", "warn"],
} as any;

if (env.isDevelopment) {
  const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };
  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = new PrismaClient(clientOptions);
  }
  prisma = globalForPrisma.prisma;
} else {
  prisma = new PrismaClient(clientOptions);
}

export default prisma;

/**
 * Graceful shutdown handler
 */
export const disconnectDatabase = async () => {
  if (prisma?.$disconnect) {
    await prisma.$disconnect();
    await pool.end(); // Also close the MariaDB pool
  }
};
