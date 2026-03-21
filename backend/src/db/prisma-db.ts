import { PrismaClient } from "@prisma/client";

/**
 * Singleton Prisma client instance for the Deku backend.
 *
 * We keep a single process-wide PrismaClient so that:
 * - DB connection pooling is handled efficiently
 * - it can be shared across route handlers / engines
 */
export const prisma = new PrismaClient({
  log:
    process.env.NODE_ENV === "development"
      ? ["query", "info", "warn", "error"]
      : ["warn", "error"],
});

export type PrismaTx = Parameters<Parameters<typeof prisma.$transaction>[0]>[0];
