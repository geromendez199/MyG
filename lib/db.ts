import { PrismaClient } from "@prisma/client";

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

function createClient() {
  return new PrismaClient();
}

export function getDb() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not configured");
  }

  if (global.prisma) {
    return global.prisma;
  }

  const client = createClient();

  if (process.env.NODE_ENV !== "production") {
    global.prisma = client;
  }

  return client;
}
