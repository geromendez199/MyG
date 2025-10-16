import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { flags } from "@/lib/env";

export const runtime = "nodejs";

export async function GET() {
  if (!flags.hasDB) {
    return NextResponse.json(
      { ok: false, error: "DATABASE_URL no configurado" },
      { status: 503 },
    );
  }

  try {
    const result = await prisma.$queryRaw`SELECT 1 as ok`;
    return NextResponse.json({ ok: true, result });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
