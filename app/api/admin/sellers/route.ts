import { NextResponse } from "next/server";

import { getDb } from "@/lib/db";
import { config } from "@/lib/config";
import { SAMPLE_SELLERS } from "@/lib/sample-data";

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

  try {
    const db = getDb();
    const sellers = await db.seller.findMany({
      where: { active: true },
      orderBy: { name: "asc" },
    });

    return NextResponse.json({ sellers, fallback: false });
  } catch (error) {
    console.warn("Falling back to sample sellers due to database error", error);
    return NextResponse.json({ sellers: SAMPLE_SELLERS, fallback: true });
  }
}
