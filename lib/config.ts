export const config = {
  primary: process.env.NEXT_PUBLIC_PRIMARY || "#1e3a8a",
  secondary: process.env.NEXT_PUBLIC_SECONDARY || "#f97316",
  supabase: {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
    serviceRole: process.env.SUPABASE_SERVICE_ROLE ?? "",
    bucket: process.env.SUPABASE_BUCKET ?? "vehicles",
  },
  adminToken: process.env.ADMIN_TOKEN ?? "",
  contacts: {
    ownerName: process.env.SELLER_OWNER_NAME ?? "MG Automotores",
    ownerPhone: process.env.SELLER_OWNER_PHONE ?? "",
  },
  seo: {
    title: "MG Automotores",
    description:
      "Encontrá tu próximo vehículo usado en MG Automotores. Autos seleccionados, financiación y asesoramiento personalizado.",
    url: process.env.NEXT_PUBLIC_SITE_URL || "https://example.com",
  },
};

export const siteName = "MG Automotores";
