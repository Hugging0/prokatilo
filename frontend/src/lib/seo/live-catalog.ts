import "server-only";

import { SEO_CATALOG_ITEMS } from "./content";
import type { SeoCatalogItem } from "./site";

const DEFAULT_BACKEND_URL =
  process.env.NODE_ENV === "production"
    ? "http://backend:8000"
    : "http://127.0.0.1:8000";

function catalogApiUrl() {
  const baseUrl = (process.env.BACKEND_INTERNAL_URL ?? DEFAULT_BACKEND_URL).replace(
    /\/$/,
    "",
  );
  return `${baseUrl}/items/`;
}

function parsePrice(value: unknown, fallback: number) {
  const price = typeof value === "number" || typeof value === "string"
    ? Number(value)
    : Number.NaN;
  return Number.isFinite(price) && price >= 0 ? price : fallback;
}

export async function getLiveSeoCatalogItems(): Promise<SeoCatalogItem[]> {
  try {
    const response = await fetch(catalogApiUrl(), {
      cache: "no-store",
      signal: AbortSignal.timeout(2500),
    });

    if (!response.ok) return SEO_CATALOG_ITEMS;

    const payload: unknown = await response.json();
    if (!Array.isArray(payload)) return SEO_CATALOG_ITEMS;

    const backendItems = new Map<number, Record<string, unknown>>();
    payload.forEach((candidate) => {
      if (
        candidate &&
        typeof candidate === "object" &&
        typeof (candidate as Record<string, unknown>).id === "number"
      ) {
        backendItems.set(
          (candidate as Record<string, unknown>).id as number,
          candidate as Record<string, unknown>,
        );
      }
    });

    return SEO_CATALOG_ITEMS.map((item) => {
      const backendItem = backendItems.get(item.appItemId);
      if (!backendItem) return item;

      return {
        ...item,
        prices: {
          short: parsePrice(backendItem.price_per_3h, item.prices.short),
          day: parsePrice(backendItem.price_per_24h, item.prices.day),
          week: parsePrice(backendItem.price_per_7d, item.prices.week),
        },
      };
    });
  } catch {
    return SEO_CATALOG_ITEMS;
  }
}
