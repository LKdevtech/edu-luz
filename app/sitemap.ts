import type { MetadataRoute } from "next";

import { SITE_URL } from "@/lib/config/seo";

// /login celowo pominięty — nie chcemy indeksować ekranu logowania.
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return [
    { url: `${SITE_URL}/`, lastModified: now, changeFrequency: "monthly", priority: 1.0 },
    { url: `${SITE_URL}/oferta`, lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    { url: `${SITE_URL}/o-nas`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${SITE_URL}/kontakt`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    {
      url: `${SITE_URL}/regulamin`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${SITE_URL}/polityka-prywatnosci`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ];
}
