import runtimeEnv, { env as rawEnv, fallback, flags } from "@/lib/env";

const DEFAULT_PRIMARY = "#1e3a8a";
const DEFAULT_SECONDARY = "#f97316";
const DEFAULT_SITE_URL = "https://example.com";
const DEFAULT_NAME = "MG Automotores";

const sanitizeColor = (value: string | undefined, fallbackColor: string) => value ?? fallbackColor;
const sanitizePhone = (phone: string | undefined) => {
  if (!phone) return "";
  const trimmed = phone.trim();
  const prefix = trimmed.startsWith("+") ? "+" : "";
  const digits = trimmed.replace(/[^0-9]/g, "");
  return digits ? `${prefix}${digits}` : "";
};

export const config = {
  primary: sanitizeColor(rawEnv.NEXT_PUBLIC_PRIMARY, DEFAULT_PRIMARY),
  secondary: sanitizeColor(rawEnv.NEXT_PUBLIC_SECONDARY, DEFAULT_SECONDARY),
  supabase: {
    url: rawEnv.NEXT_PUBLIC_SUPABASE_URL ?? "",
    anonKey: rawEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
    bucket: rawEnv.SUPABASE_BUCKET ?? "vehicles",
  },
  adminToken: rawEnv.ADMIN_TOKEN ?? "",
  contacts: {
    ownerName: rawEnv.SELLER_OWNER_NAME ?? DEFAULT_NAME,
    ownerPhone: sanitizePhone(rawEnv.SELLER_OWNER_PHONE),
  },
  seo: {
    title: DEFAULT_NAME,
    description:
      "Encontrá tu próximo vehículo usado en MG Automotores. Autos seleccionados, financiación y asesoramiento personalizado.",
    url: rawEnv.NEXT_PUBLIC_SITE_URL ?? DEFAULT_SITE_URL,
  },
  flags,
  fallback,
  provider: runtimeEnv.provider,
} as const;

export const siteName = config.seo.title;
