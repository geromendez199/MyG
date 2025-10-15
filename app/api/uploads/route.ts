import { NextResponse } from "next/server";
import { config } from "@/lib/config";
import { supabaseAdmin } from "@/lib/supabase";

function isAuthorized(request: Request) {
  const token = request.headers.get("authorization");
  if (!token || !config.adminToken) return false;
  return token === `Bearer ${config.adminToken}`;
}

export const runtime = "edge";

export async function POST(request: Request) {
  if (!isAuthorized(request)) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return new NextResponse("Archivo inválido", { status: 400 });
  }

  if (!file.type.startsWith("image/")) {
    return new NextResponse("Solo se permiten imágenes", { status: 400 });
  }

  const maxSize = 5 * 1024 * 1024;
  if (file.size > maxSize) {
    return new NextResponse("Imagen demasiado grande (máx 5MB)", { status: 400 });
  }

  const supabase = supabaseAdmin();
  const ext = file.name.split(".").pop() || "jpg";
  const path = `${crypto.randomUUID()}.${ext}`;

  const { data, error } = await supabase.storage
    .from(config.supabase.bucket)
    .upload(path, await file.arrayBuffer(), {
      contentType: file.type,
      upsert: false,
    });

  if (error) {
    return new NextResponse(error.message, { status: 500 });
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from(config.supabase.bucket).getPublicUrl(data.path);

  return NextResponse.json({ url: publicUrl });
}
