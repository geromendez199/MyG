import "dotenv/config";

import { createClient } from "@supabase/supabase-js";

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const service = process.env.SUPABASE_SERVICE_ROLE;
  const bucket = process.env.SUPABASE_BUCKET;

  if (!url || !service || !bucket) {
    throw new Error("Faltan variables NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE o SUPABASE_BUCKET");
  }

  const supabase = createClient(url, service);
  const path = `diagnostics/test-${Date.now()}.txt`;
  const content = new TextEncoder().encode("hello from diagnose");

  const { error } = await supabase.storage.from(bucket).upload(path, content, {
    contentType: "text/plain",
    upsert: true,
  });

  if (error) {
    throw error;
  }

  const publicUrl = `${url}/storage/v1/object/public/${bucket}/${path}`;
  console.log("✅ Upload OK:", publicUrl);
}

main().catch((error) => {
  console.error("❌ Upload error:", error);
  process.exit(1);
});
