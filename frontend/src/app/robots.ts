import type { MetadataRoute } from "next";

import { SEO_PRIVATE_ROUTES } from "@/lib/seo/routes";
import { SEO_SITE_URL } from "@/lib/seo/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: SEO_PRIVATE_ROUTES,
    },
    sitemap: `${SEO_SITE_URL}/sitemap.xml`,
  };
}
