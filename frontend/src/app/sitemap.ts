import type { MetadataRoute } from "next";

import { SEO_PAGES } from "@/lib/seo/pages";
import { SEO_SITE_URL, SEO_UPDATED_AT } from "@/lib/seo/site";

const PUBLIC_ROUTES = [
  "/privacy",
  "/terms",
  "/consent",
  "/contacts",
  "/delivery-payment",
] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  const seoRoutes = SEO_PAGES.map((page) => ({
    url: `${SEO_SITE_URL}${page.path}`,
    lastModified: new Date(page.updatedAt),
    changeFrequency: page.changeFrequency ?? "monthly",
    priority: page.priority ?? 0.7,
  }));

  const legalRoutes = PUBLIC_ROUTES.map((route) => ({
    url: `${SEO_SITE_URL}${route}`,
    lastModified: new Date(SEO_UPDATED_AT),
    changeFrequency: "yearly" as const,
    priority: 0.45,
  }));

  return [...seoRoutes, ...legalRoutes];
}
