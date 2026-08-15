import type { SeoProductSlug } from "@/lib/seo/site";

const PRODUCT_TITLE_ALIASES: Record<SeoProductSlug, readonly string[]> = {
  ps5: ["PS5 Slim, 2 джойстика", "PlayStation 5"],
  "playstation-vr": ["PlayStation VR2", "PlayStation VR"],
  "robot-moyshchik-okon": ["Робот-мойщик окон", "Робот-мойщик окон DOMASHI Ley"],
  "moyushchiy-pylesos-dlya-mebeli": [
    "Моющий пылесос для мебели",
    "Моющий пылесос HOMIKO VCC-01",
  ],
  "instax-square-sq1": ["Instax Square SQ1"],
  "xbox-series-s": ["Xbox Series S 512 ГБ"],
  "perforator-sds-plus": ["Перфоратор SDS+"],
  "elektrootvertka-makita-df001dw": ["Электроотвертка Makita DF001DW"],
};

export function isSeoProductSlug(value: string): value is SeoProductSlug {
  return Object.hasOwn(PRODUCT_TITLE_ALIASES, value);
}

export function findCatalogItemBySlug<T extends { title: string }>(
  items: T[],
  slug: SeoProductSlug,
): T | null {
  const aliases = PRODUCT_TITLE_ALIASES[slug];
  return items.find((item) => aliases.includes(item.title)) ?? null;
}
