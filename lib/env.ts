import { z } from "zod";

const colorRegex = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;

const envSchema = z.object({
  NEXT_PUBLIC_PRIMARY: z.string().regex(colorRegex).optional(),
  NEXT_PUBLIC_SECONDARY: z.string().regex(colorRegex).optional(),
  NEXT_PUBLIC_SITE_URL: z.string().url().optional(),
  SELLER_OWNER_NAME: z.string().optional(),
  SELLER_OWNER_PHONE: z.string().optional(),
  ADMIN_TOKEN: z.string().optional(),
  NEXT_PUBLIC_SUPABASE_URL: z.string().url().optional(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().optional(),
  SUPABASE_SERVICE_ROLE: z.string().optional(),
  SUPABASE_BUCKET: z.string().optional(),
});

/**
 * Centralizamos la validación de variables para detectar configuraciones inválidas en build.
 */
export const env = envSchema.parse({
  NEXT_PUBLIC_PRIMARY: process.env.NEXT_PUBLIC_PRIMARY,
  NEXT_PUBLIC_SECONDARY: process.env.NEXT_PUBLIC_SECONDARY,
  NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
  SELLER_OWNER_NAME: process.env.SELLER_OWNER_NAME,
  SELLER_OWNER_PHONE: process.env.SELLER_OWNER_PHONE,
  ADMIN_TOKEN: process.env.ADMIN_TOKEN,
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  SUPABASE_SERVICE_ROLE: process.env.SUPABASE_SERVICE_ROLE,
  SUPABASE_BUCKET: process.env.SUPABASE_BUCKET,
});
