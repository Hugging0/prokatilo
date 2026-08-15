import { SEO_PAGES } from "./pages";
import type { SeoRoute } from "./site";

export const SEO_INDEXABLE_ROUTES: SeoRoute[] = [
  ...SEO_PAGES.map((page) => page.path),
  "/privacy",
  "/terms",
  "/consent",
  "/contacts",
  "/delivery-payment",
];

export const SEO_PRIVATE_ROUTES = [
  "/app/profile",
  "/app/orders",
  "/app/checkout",
  "/admin",
  "/admin-dashboard",
  "/api",
];
