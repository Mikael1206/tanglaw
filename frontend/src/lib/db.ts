/**
 * Shared Prisma client instance for the frontend AI tooling layer.
 * Ensures a singleton client during development to prevent hot reload duplication.
 */
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient() {
  if (!process.env.DATABASE_URL) {
    throw new Error(
      "Missing DATABASE_URL environment variable. Set DATABASE_URL for Prisma client initialization."
    );
  }

  return new PrismaClient();
}

export function getPrisma() {
  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = createPrismaClient();
  }
  return globalForPrisma.prisma;
}

if (process.env.NODE_ENV !== "production") {
  if (!globalForPrisma.prisma && process.env.DATABASE_URL) {
    globalForPrisma.prisma = createPrismaClient();
  }
}
