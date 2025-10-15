import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { config } from "@/lib/config";

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

  const sellers = await db.seller.findMany({
    where: { active: true },
    orderBy: { name: "asc" },
  });

  return NextResponse.json({ sellers });
}
