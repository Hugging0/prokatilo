import type { AppItem, TariffType } from "@/types";

interface TariffMeta {
  id: TariffType;
  label: string;
  shortLabel: string;
}

export const TARIFFS: TariffMeta[] = [
  {
    id: "3h",
    label: "3 часа",
    shortLabel: "3 ч",
  },
  {
    id: "24h",
    label: "сутки",
    shortLabel: "24 ч",
  },
  {
    id: "7d",
    label: "неделя",
    shortLabel: "7 д",
  },
];

export function getTariffLabel(tariff: TariffType): string {
  switch (tariff) {
    case "3h":
      return "3 часа";
    case "6h":
      return "6 часов";
    case "24h":
      return "сутки";
    case "7d":
      return "неделя";
  }
}

export function getTariffShortLabel(tariff: TariffType): string {
  switch (tariff) {
    case "3h":
      return "3 ч";
    case "6h":
      return "6 ч";
    case "24h":
      return "24 ч";
    case "7d":
      return "7 д";
  }
}

export function getTariffPrice(item: AppItem, tariff: TariffType): number {
  switch (tariff) {
    case "3h":
      return item.price3h;
    case "6h":
      return item.price6h;
    case "24h":
      return item.price24h;
    case "7d":
      return item.price24h * 7;
  }
}

export function getTariffDurationMs(tariff: TariffType): number {
  switch (tariff) {
    case "3h":
      return 3 * 60 * 60 * 1000;
    case "6h":
      return 6 * 60 * 60 * 1000;
    case "24h":
      return 24 * 60 * 60 * 1000;
    case "7d":
      return 7 * 24 * 60 * 60 * 1000;
  }
}

export function getRentalTotalPrice(
  item: AppItem,
  tariff: TariffType,
  startAt: Date | null,
  endAt: Date | null,
): number {
  const unitPrice = getTariffPrice(item, tariff);

  if (!startAt || !endAt || endAt <= startAt) {
    return unitPrice;
  }

  const unitsCount = Math.max(
    1,
    Math.ceil((endAt.getTime() - startAt.getTime()) / getTariffDurationMs(tariff)),
  );
  return unitPrice * unitsCount;
}
