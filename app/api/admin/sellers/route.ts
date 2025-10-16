import { NextResponse } from "next/server";

import { config } from "@/lib/config";
import { SAMPLE_SELLERS } from "@/lib/sample-data";
import { fallback as isFallbackMode, flags } from "@/lib/env";
import { prisma } from "@/lib/prisma";

function isAuthorized(request: Request) {
  const token = request.headers.get("authorization");
  if (!token || !config.adminToken) return false;
  return token === `Bearer ${config.adminToken}`;
}

export async function GET(request: Request) {
  if (!isAuthorized(request)) {
    // En build o sin token, devolver vacío para evitar error
    return NextResponse.json({ sellers: [] });
  }

  if (isFallbackMode || !flags.hasDB) {
    return NextResponse.json({ sellers: SAMPLE_SELLERS, fallback: true });
  }

  try {
    const sellers = await prisma.seller.findMany({
      where: { active: true },
      orderBy: { name: "asc" },
    });

    return NextResponse.json({ sellers, fallback: false });
  } catch (error) {
    console.warn("Falling back to sample sellers due to database error", error);
    return NextResponse.json({ sellers: SAMPLE_SELLERS, fallback: true });
  }
}
