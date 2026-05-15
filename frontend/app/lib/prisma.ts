// app/lib/prisma.ts
//
// Prisma Accelerate (prisma+postgres:// URL):
// - Requires: prisma generate --no-engine
// - Import: @prisma/client (standard, NOT edge — edge is for edge runtimes only)
// - Must pass datasourceUrl explicitly to constructor
// - Use withAccelerate() extension

import { PrismaClient } from "@prisma/client";
import { withAccelerate } from "@prisma/extension-accelerate";

const globalForPrisma = globalThis as unknown as {
  prisma: ReturnType<typeof createPrismaClient> | undefined;
};

function createPrismaClient() {
  const url = process.env.DATABASE_URL;

  if (!url) {
    throw new Error(
      "[Prisma] DATABASE_URL tidak ditemukan. Pastikan file .env berisi DATABASE_URL.",
    );
  }

  return new PrismaClient({
    datasourceUrl: url,
  }).$extends(withAccelerate());
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
