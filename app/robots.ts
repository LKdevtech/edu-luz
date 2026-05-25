import type { MetadataRoute } from "next";

import { SITE_URL } from "@/lib/config/seo";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // Ekran logowania i przyszły panel nie powinny trafiać do indeksu.
        disallow: ["/login", "/panel/"],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
