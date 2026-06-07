import type { MetadataRoute } from "next";

const SITE_URL = "https://prokatilo.com";

const PUBLIC_ROUTES = [
  "/",
  "/privacy",
  "/terms",
  "/consent",
  "/contacts",
  "/delivery-payment",
];

export default function sitemap(): MetadataRoute.Sitemap {
  return PUBLIC_ROUTES.map((route) => ({
    url: `${SITE_URL}${route}`,
    lastModified: new Date(),
    changeFrequency: route === "/" ? "daily" : "monthly",
    priority: route === "/" ? 1 : 0.7,
  }));
}
