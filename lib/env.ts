import { z } from "zod";

const colorRegex = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;

const EnvSchema = z.object({
  DATABASE_URL: z.string().url().optional(),
  DIRECT_URL: z.string().url().optional(),
  NEXT_PUBLIC_SUPABASE_URL: z.string().url().optional(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(10).optional(),
  SUPABASE_SERVICE_ROLE: z.string().min(10).optional(),
  SUPABASE_BUCKET: z.string().min(1).default("vehicles"),
  ADMIN_TOKEN: z.string().min(16).optional(),
  SELLER_OWNER_NAME: z.string().optional(),
  SELLER_OWNER_PHONE: z.string().optional(),
  SELLER_MARTIN_PHONE: z.string().optional(),
  DB_PROVIDER: z.enum(["supabase", "neon", "vercel-postgres"]).default("supabase"),
  NEXT_PUBLIC_PRIMARY: z.string().regex(colorRegex).optional(),
  NEXT_PUBLIC_SECONDARY: z.string().regex(colorRegex).optional(),
  NEXT_PUBLIC_SITE_URL: z.string().url().optional(),
});

const raw = {
  DATABASE_URL: process.env.DATABASE_URL,
  DIRECT_URL: process.env.DIRECT_URL,
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  SUPABASE_SERVICE_ROLE: process.env.SUPABASE_SERVICE_ROLE,
  SUPABASE_BUCKET: process.env.SUPABASE_BUCKET,
  ADMIN_TOKEN: process.env.ADMIN_TOKEN,
  SELLER_OWNER_NAME: process.env.SELLER_OWNER_NAME,
  SELLER_OWNER_PHONE: process.env.SELLER_OWNER_PHONE,
  SELLER_MARTIN_PHONE: process.env.SELLER_MARTIN_PHONE,
  DB_PROVIDER: process.env.DB_PROVIDER,
  NEXT_PUBLIC_PRIMARY: process.env.NEXT_PUBLIC_PRIMARY,
  NEXT_PUBLIC_SECONDARY: process.env.NEXT_PUBLIC_SECONDARY,
  NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
};

const parsed = EnvSchema.safeParse(raw);

if (!parsed.success) {
  console.error("❌ Env validation error:", parsed.error.flatten().fieldErrors);
  throw new Error("Environment variables are invalid or missing. Revisá .env.local");
}

export const env = parsed.data;

// Flags centralizan decisiones de runtime para que el resto del código no tenga que tocar process.env directamente.
export const flags = {
  hasDB: Boolean(env.DATABASE_URL),
  hasStorage:
    Boolean(env.NEXT_PUBLIC_SUPABASE_URL) &&
    Boolean(env.NEXT_PUBLIC_SUPABASE_ANON_KEY) &&
    Boolean(env.SUPABASE_SERVICE_ROLE) &&
    Boolean(env.SUPABASE_BUCKET),
  hasAdmin: Boolean(env.ADMIN_TOKEN),
};

export const fallback = !flags.hasDB;

const runtimeEnv = {
  ...env,
  flags,
  fallback,
  provider: parsed.data.DB_PROVIDER ?? "supabase",
};

export default runtimeEnv;
