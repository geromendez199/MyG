import type { MetadataRoute } from "next";

import { buildCanonicalUrl } from "@/lib/seo";
import { fetchAllVehicles } from "@/lib/vehicle-repository";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Mantenemos el sitemap actualizado sin depender de datos estáticos ni de la base de datos en build.
  const base = buildCanonicalUrl("/");
  const entries: MetadataRoute.Sitemap = [
    {
      url: base,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
  ];

  const { vehicles } = await fetchAllVehicles();
  for (const vehicle of vehicles) {
    entries.push({
      url: buildCanonicalUrl(`/vehicle/${vehicle.slug}`),
      lastModified: vehicle.updatedAt,
      changeFrequency: "weekly",
      priority: 0.6,
    });
  }

  return entries;
}
