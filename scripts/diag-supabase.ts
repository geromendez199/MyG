import "./utils/load-env";

function assertPresent(key: string) {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Falta ${key}`);
  }
  return value;
}

try {
  const keys = [
    "DATABASE_URL",
    "DIRECT_URL",
    "NEXT_PUBLIC_SUPABASE_URL",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY",
    "SUPABASE_SERVICE_ROLE",
    "SUPABASE_BUCKET",
    "ADMIN_TOKEN",
  ];

  for (const key of keys) {
    assertPresent(key);
  }

  const databaseUrl = assertPresent("DATABASE_URL");
  if (!databaseUrl.includes(":6543")) {
    console.warn("⚠️ DATABASE_URL debería usar el puerto 6543 para PgBouncer en Vercel.");
  }
  if (!/pgbouncer=true/.test(databaseUrl)) {
    console.warn("⚠️ Agregá pgbouncer=true a DATABASE_URL para conexiones serverless estables.");
  }
  if (!/connection_limit=1/.test(databaseUrl)) {
    console.warn("⚠️ Agregá connection_limit=1 a DATABASE_URL para limitar conexiones en Vercel.");
  }
  if (!/sslmode=require/.test(databaseUrl)) {
    console.warn("⚠️ Asegurate de incluir sslmode=require en DATABASE_URL.");
  }

  console.log("DIAG_OK");
} catch (error) {
  const message = error instanceof Error ? error.message : String(error);
  console.error("DIAG_FAIL", message);
  process.exit(1);
}
