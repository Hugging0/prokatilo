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
    id: "6h",
    label: "6 часов",
    shortLabel: "6 ч",
  },
  {
    id: "24h",
    label: "Сутки",
    shortLabel: "24 ч",
  },
];

export function getTariffPrice(item: AppItem, tariff: TariffType): number {
  switch (tariff) {
    case "3h":
      return item.price3h;
    case "6h":
      return item.price6h;
    case "24h":
      return item.price24h;
  }
}
