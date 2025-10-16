import { NextResponse } from "next/server";
import { config } from "@/lib/config";
import { supabaseAdmin } from "@/lib/supabase";

function isAuthorized(request: Request) {
  const token = request.headers.get("authorization");
  if (!token || !config.adminToken) return false;
  return token === `Bearer ${config.adminToken}`;
}

// We rely on Supabase's Node client to upload binary payloads. The storage
// helpers are not fully compatible with the Edge runtime, so we explicitly use
// the Node runtime to avoid subtle "unsupported platform" errors in production.
export const runtime = "nodejs";

export async function POST(request: Request) {
  if (!isAuthorized(request)) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  // When Supabase credentials are missing we want to fail fast with a
  // descriptive message rather than throwing and returning a generic 500.
  const { url, serviceRole, bucket } = config.supabase;
  if (!url || !serviceRole || !bucket) {
    return NextResponse.json(
      {
        error:
          "Supabase no está configurado. Definí NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE y SUPABASE_BUCKET para habilitar las cargas.",
      },
      { status: 503 },
    );
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

  try {
    const supabase = supabaseAdmin();
    const ext = file.name.split(".").pop() || "jpg";
    const path = `${crypto.randomUUID()}.${ext}`;

    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, await file.arrayBuffer(), {
        contentType: file.type,
        upsert: false,
      });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 502 });
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from(bucket).getPublicUrl(data.path);

    return NextResponse.json({ url: publicUrl });
  } catch (error) {
    console.error("Supabase upload failed", error);
    return NextResponse.json(
      { error: "No se pudo subir la imagen. Revisá la configuración de Supabase." },
      { status: 500 },
    );
  }
}
