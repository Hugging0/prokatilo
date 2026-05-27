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
    price6h: Number(item.price_per_6h),
    price24h: Number(item.price_per_24h),
    available: item.is_available && item.is_active,
    active: item.is_active,
    iconKey: item.icon_key,
    imageUrl: item.image_url,
    sortOrder: item.sort_order,
    ...presentation,
  };
}

export function mapBackendItemsToAppItems(
  items: BackendItemDto[],
): AppItem[] {
  return items.map(mapBackendItemToAppItem);
}
