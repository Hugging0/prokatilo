import { Brush, Gamepad2, Package, Sparkles } from "lucide-react";

import type { AppItem, BackendItemDto } from "@/types";

type ItemPresentation = Pick<AppItem, "icon" | "color" | "border" | "bg">;

const ICON_PRESENTATION: Record<string, ItemPresentation> = {
  gamepad: {
    icon: Gamepad2,
    color: "text-indigo-500",
    border: "border-indigo-500",
    bg: "bg-indigo-50",
  },
  sparkles: {
    icon: Sparkles,
    color: "text-cyan-500",
    border: "border-cyan-500",
    bg: "bg-cyan-50",
  },
  brush: {
    icon: Brush,
    color: "text-emerald-500",
    border: "border-emerald-500",
    bg: "bg-emerald-50",
  },
  package: {
    icon: Package,
    color: "text-rose-500",
    border: "border-rose-500",
    bg: "bg-rose-50",
  },
  vacuum: {
    icon: Brush,
    color: "text-emerald-500",
    border: "border-emerald-500",
    bg: "bg-emerald-50",
  },
};

export const ITEM_ICON_KEYS = [
  "gamepad",
  "sparkles",
  "brush",
  "package",
  "vacuum",
] as const;

function getItemPresentation(iconKey: string): ItemPresentation {
  return ICON_PRESENTATION[iconKey] ?? ICON_PRESENTATION.package;
}

function getTransparentCatalogImageUrl(imageUrl: string | null): string | null {
  const catalogPath = "/uploads/catalog/items/";

  if (!imageUrl?.includes(catalogPath)) return imageUrl;
  if (imageUrl.includes(`${catalogPath}transparent/`)) return imageUrl;

  const fileName = imageUrl.split("/").pop();
  if (!fileName) return imageUrl;

  return `${catalogPath}transparent/${fileName}`;
}

export function mapBackendItemToAppItem(
  item: BackendItemDto,
): AppItem {
  const presentation = getItemPresentation(item.icon_key);

  return {
    id: item.id,
    title: item.title,
    desc: item.description ?? "",
    category: item.category,
    price3h: Number(item.price_per_3h),
    price24h: Number(item.price_per_24h),
    price7d: Number(item.price_per_7d),
    available: item.is_available && item.is_active,
    active: item.is_active,
    iconKey: item.icon_key,
    imageUrl: getTransparentCatalogImageUrl(item.image_url),
    sortOrder: item.sort_order,
    ...presentation,
  };
}

export function mapBackendItemsToAppItems(
  items: BackendItemDto[],
): AppItem[] {
  return items.map(mapBackendItemToAppItem);
}
