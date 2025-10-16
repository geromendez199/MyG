import "./utils/load-env";

import { prisma } from "../lib/prisma";

async function main() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    console.log("DB_SMOKE_OK");
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("DB_SMOKE_FAIL", message);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
}

void main();
