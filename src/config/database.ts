import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { PrismaClient } from "../generated/prisma/client";
import { env } from "./environment.js";

// 1. Initialize the connection pool using your environment variable

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const adapter = new PrismaPg(pool);

let prisma: PrismaClient;

const clientOptions: ConstructorParameters<typeof PrismaClient>[0] = {
  adapter,
  log: env.isDevelopment ? ["query", "error", "warn"] : ["error", "warn"],
};

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
    await pool.end(); // Also close the PostgresSQL pool
  }
};
