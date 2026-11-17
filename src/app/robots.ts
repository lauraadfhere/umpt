import type { MetadataRoute } from "next";
import { routing } from "@/i18n/routing";
import { PUBLIC_SITE_URL, SITE_HOST } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", ...routing.locales.flatMap((locale) => [`/${locale}/dashboard`, `/${locale}/login`])],
      },
    ],
    host: SITE_HOST,
    sitemap: `${PUBLIC_SITE_URL}/sitemap.xml`,
  };
}
