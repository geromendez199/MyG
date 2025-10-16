import type { VehicleWithSeller } from "@/lib/types";
import { config } from "@/lib/config";

const siteUrl = (() => {
  try {
    const url = new URL(config.seo.url);
    url.hash = "";
    url.search = "";
    return url.toString().replace(/\/$/, "");
  } catch {
    return "https://example.com";
  }
})();

export function buildCanonicalUrl(path: string) {
  // Normalizamos paths para evitar canónicos duplicados con o sin slash final.
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${siteUrl}${normalized}`;
}

export function buildVehicleJsonLd(vehicle: VehicleWithSeller) {
  // Schema Vehicle + Offer para mejorar rich snippets en Google.
  return {
    "@context": "https://schema.org",
    "@type": "Vehicle",
    name: vehicle.title,
    brand: vehicle.brand,
    model: vehicle.model,
    url: buildCanonicalUrl(`/vehicle/${vehicle.slug}`),
    productionDate: vehicle.year,
    description: vehicle.description ?? undefined,
    image: vehicle.images.length ? vehicle.images : undefined,
    vehicleIdentificationNumber: vehicle.id,
    seller: {
      "@type": "Organization",
      name: vehicle.seller.name,
      telephone: vehicle.seller.phoneE164,
    },
    offers: vehicle.priceARS
      ? {
          "@type": "Offer",
          price: vehicle.priceARS,
          priceCurrency: "ARS",
          availability: vehicle.published ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
        }
      : undefined,
  };
}
