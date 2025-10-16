import { PrismaClient } from "@prisma/client";

import { flags } from "@/lib/env";

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

const globalForPrisma = global as typeof globalThis & { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ["query", "error", "warn"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

// Prisma debe inicializarse solo cuando la base está disponible; en modo demo devolvemos un error descriptivo.
export function getDb() {
  if (!flags.hasDB) {
    throw new Error("DATABASE_URL is not configured; demo mode is active");
  }

  return prisma;
}
