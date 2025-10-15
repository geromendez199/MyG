import { NextResponse } from "next/server";
import { config } from "@/lib/config";

function isAuthorized(request: Request) {
  const token = request.headers.get("authorization");
  if (!token || !config.adminToken) return false;
  return token === `Bearer ${config.adminToken}`;
}

export const runtime = "edge";

export async function HEAD(request: Request) {
  if (!isAuthorized(request)) {
    return new NextResponse(null, { status: 401 });
  }
  return new NextResponse(null, { status: 200 });
}
