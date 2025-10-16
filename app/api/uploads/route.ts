import { NextRequest, NextResponse } from "next/server";

import { config } from "@/lib/config";
import env, { flags } from "@/lib/env";
import { supabaseServiceClient } from "@/lib/supabase";

function isAuthorized(request: Request) {
  const token = request.headers.get("authorization");
  if (!token || !config.adminToken) return false;
  return token === `Bearer ${config.adminToken}`;
}

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  if (!isAuthorized(request)) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  if (!flags.hasStorage) {
    return NextResponse.json(
      { error: "Supabase Storage no configurado. Falta URL/keys/bucket." },
      { status: 400 },
    );
  }

  const formData = await request.formData();
  const file = formData.get("file");
  const prefix = (formData.get("prefix") as string | null) ?? "";

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

  try {
    const supabase = supabaseServiceClient();
    // Sanitizamos prefijos/nombres para evitar path traversal y caracteres inválidos en Supabase Storage.
    const safePrefix = prefix
      ? prefix
          .replace(/\.\./g, "")
          .replace(/^\/*/, "")
          .replace(/[^a-zA-Z0-9/_-]/g, "")
      : "";
    const normalizedPrefix = safePrefix ? `${safePrefix.replace(/\/*$/, "")}/` : "";
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9._-]/g, "");
    const path = `${normalizedPrefix}${Date.now()}-${sanitizedName}`.replace(/\/+/g, "/");
    const bytes = new Uint8Array(await file.arrayBuffer());

    const { data, error } = await supabase.storage.from(env.SUPABASE_BUCKET).upload(path, bytes, {
      contentType: file.type,
      upsert: true,
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 502 });
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from(env.SUPABASE_BUCKET).getPublicUrl(data.path);

    return NextResponse.json({ url: publicUrl, path: data.path });
  } catch (error) {
    console.error("Supabase upload failed", error);
    return NextResponse.json(
      { error: "No se pudo subir la imagen. Revisá la configuración de Supabase." },
      { status: 500 },
    );
  }
}
