import "dotenv/config";

import { createClient } from "@supabase/supabase-js";
import { PrismaClient } from "@prisma/client";

function mask(value?: string | null) {
  if (!value) return "MISSING";
  if (value.length <= 8) return "****";
  return `${value.slice(0, 4)}...${value.slice(-4)}`;
}

(async () => {
  console.log("--- ENV CHECK ---");
  const keys = [
    "DATABASE_URL",
    "DIRECT_URL",
    "NEXT_PUBLIC_SUPABASE_URL",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY",
    "SUPABASE_SERVICE_ROLE",
    "SUPABASE_BUCKET",
    "ADMIN_TOKEN",
    "SELLER_OWNER_NAME",
    "SELLER_OWNER_PHONE",
    "SELLER_MARTIN_PHONE",
  ] as const;

  for (const key of keys) {
    console.log(`${key} = ${mask(process.env[key])}`);
  }

  console.log("\n--- PRISMA: SELECT 1 ---");
  const prisma = new PrismaClient();
  try {
    const result = await prisma.$queryRawUnsafe("SELECT 1 as ok;");
    console.log("✅ DB OK:", result);
  } catch (error) {
    console.error("❌ Error DB:", error);
  } finally {
    await prisma.$disconnect();
  }

  console.log("\n--- SUPABASE STORAGE LIST ---");
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const service = process.env.SUPABASE_SERVICE_ROLE;
  const bucket = process.env.SUPABASE_BUCKET;

  if (!url || !service || !bucket) {
    console.error("❌ Error Storage: faltan variables de entorno requeridas");
    return;
  }

  try {
    const supabase = createClient(url, service);
    const { error } = await supabase.storage.from(bucket).list("", { limit: 1 });
    if (error) throw error;
    console.log(`✅ Storage OK. Bucket "${bucket}" accesible.`);
  } catch (error) {
    console.error("❌ Error Storage:", error);
  }
})();
