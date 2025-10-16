import "./utils/load-env";

import env from "../lib/env";

const allowDemo = process.env.ALLOW_DEMO_MODE === "true";
const missing: string[] = [];

if (!env.DATABASE_URL) {
  missing.push("DATABASE_URL (pooler 6543 con pgBouncer)");
}

if (!env.DIRECT_URL) {
  missing.push("DIRECT_URL (puerto 5432 sin pgBouncer)");
}

if (!env.flags.hasStorage) {
  missing.push("Supabase Storage (NEXT_PUBLIC_SUPABASE_URL / ANON_KEY / SUPABASE_SERVICE_ROLE / SUPABASE_BUCKET)");
}

if (!env.flags.hasAdmin) {
  missing.push("ADMIN_TOKEN");
}

if (missing.length > 0 && !allowDemo) {
  console.error("❌ Configuración incompleta:\n -", missing.join("\n - "));
  console.error("Establecé las variables indicadas o ejecutá con ALLOW_DEMO_MODE=true para omitir este chequeo temporalmente.");
  process.exit(1);
}

if (missing.length > 0 && allowDemo) {
  console.warn("⚠️ Ejecutando en modo demo. Variables faltantes:\n -", missing.join("\n - "));
} else {
  console.log("✅ Variables de entorno validadas. Proveedor:", env.provider);
}
