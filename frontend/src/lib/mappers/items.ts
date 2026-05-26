import { Brush, Gamepad2, Sparkles } from "lucide-react";

import type { AppItem, BackendItemDto } from "@/types";

function getItemPresentation(title: string): Pick<
  AppItem,
  "icon" | "color" | "border" | "bg" | "category"
> {
  const normalizedTitle = title.toLowerCase();

  if (
    normalizedTitle.includes("playstation") ||
    normalizedTitle.includes("ps") ||
    normalizedTitle.includes("vr")
  ) {
    return {
      icon: Gamepad2,
      color: "text-indigo-500",
      border: "border-indigo-500",
      bg: "bg-indigo-50",
      category: "Игры",
    };
  }

  if (
    normalizedTitle.includes("пылесос") ||
    normalizedTitle.includes("мойщик") ||
    normalizedTitle.includes("убор")
  ) {
    return {
      icon: Sparkles,
      color: "text-cyan-500",
      border: "border-cyan-500",
      bg: "bg-cyan-50",
      category: "Уборка",
    };
  }

  return {
    icon: Brush,
    color: "text-emerald-500",
    border: "border-emerald-500",
    bg: "bg-emerald-50",
    category: "Техника",
  };
}

export function mapBackendItemToAppItem(
  item: BackendItemDto,
): AppItem {
  const presentation = getItemPresentation(item.title);

  return {
    id: item.id,
    title: item.title,
    desc: item.description ?? "",
    price3h: Number(item.price_per_3h),
    price6h: Number(item.price_per_6h),
    price24h: Number(item.price_per_24h),
    available: item.is_available,
    ...presentation,
  };
}

export function mapBackendItemsToAppItems(
  items: BackendItemDto[],
): AppItem[] {
  return items.map(mapBackendItemToAppItem);
}
