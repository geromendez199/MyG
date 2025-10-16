import { env } from "@/lib/env";

const DEFAULT_PRIMARY = "#1e3a8a";
const DEFAULT_SECONDARY = "#f97316";
const DEFAULT_SITE_URL = "https://example.com";
const DEFAULT_NAME = "MG Automotores";

const sanitizeColor = (value: string | undefined, fallback: string) => value ?? fallback;
const sanitizePhone = (phone: string | undefined) => phone?.replace(/\s+/g, "") ?? "";

export const config = {
  primary: sanitizeColor(env.NEXT_PUBLIC_PRIMARY, DEFAULT_PRIMARY),
  secondary: sanitizeColor(env.NEXT_PUBLIC_SECONDARY, DEFAULT_SECONDARY),
  supabase: {
    url: env.NEXT_PUBLIC_SUPABASE_URL ?? "",
    anonKey: env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
    serviceRole: env.SUPABASE_SERVICE_ROLE ?? "",
    bucket: env.SUPABASE_BUCKET ?? "vehicles",
  },
  adminToken: env.ADMIN_TOKEN ?? "",
  contacts: {
    ownerName: env.SELLER_OWNER_NAME ?? DEFAULT_NAME,
    ownerPhone: sanitizePhone(env.SELLER_OWNER_PHONE),
  },
  seo: {
    title: DEFAULT_NAME,
    description:
      "Encontrá tu próximo vehículo usado en MG Automotores. Autos seleccionados, financiación y asesoramiento personalizado.",
    url: env.NEXT_PUBLIC_SITE_URL ?? DEFAULT_SITE_URL,
  },
} as const;

export const siteName = config.seo.title;
