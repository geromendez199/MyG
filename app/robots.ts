import type { MetadataRoute } from "next";

import { config } from "@/lib/config";

export default function robots(): MetadataRoute.Robots {
  // Bloqueamos rutas administrativas y exponemos el sitemap generado dinámicamente.
  return {
    rules: {
      userAgent: "*",
      allow: ["/"],
      disallow: ["/admin", "/api"],
    },
    sitemap: `${config.seo.url.replace(/\/$/, "")}/sitemap.xml`,
  };
}
