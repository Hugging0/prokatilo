import { UI_COPY } from "@/lib/copy";
import type {
  AdminItemFormPayload,
  BackendItemDto,
  CatalogItemFormState,
} from "@/types";

export const EMPTY_CATALOG_FORM: CatalogItemFormState = {
  title: "",
  description: "",
  category: "Техника",
  price_per_3h: "",
  price_per_24h: "",
  price_per_7d: "",
  image_url: "",
  icon_key: "package",
  sort_order: "100",
  is_available: true,
  is_active: true,
};

export type CatalogFilter = "all" | "active" | "hidden" | "paused";

export const CATALOG_FILTERS: Array<{ id: CatalogFilter; label: string }> = [
  { id: "all", label: "Все" },
  { id: "active", label: "В каталоге" },
  { id: "hidden", label: "Скрытые" },
  { id: "paused", label: "На паузе" },
];

export function toCatalogFormState(item: BackendItemDto): CatalogItemFormState {
  return {
    title: item.title,
    description: item.description ?? "",
    category: item.category,
    price_per_3h: String(Number(item.price_per_3h)),
    price_per_24h: String(Number(item.price_per_24h)),
    price_per_7d: String(Number(item.price_per_7d)),
    image_url: item.image_url ?? "",
    icon_key: item.icon_key,
    sort_order: String(item.sort_order),
    is_available: item.is_available,
    is_active: item.is_active,
  };
}

export function normalizeCatalogPayload(
  form: CatalogItemFormState,
): AdminItemFormPayload {
  return {
    title: form.title.trim(),
    description: form.description.trim() || null,
    category: form.category.trim(),
    price_per_3h: Number(form.price_per_3h),
    price_per_24h: Number(form.price_per_24h),
    price_per_7d: Number(form.price_per_7d),
    image_url: form.image_url.trim() || null,
    icon_key: form.icon_key.trim() || "package",
    sort_order: Number(form.sort_order),
    is_available: form.is_available,
    is_active: form.is_active,
  };
}

export function validateCatalogForm(form: CatalogItemFormState): string | null {
  if (!form.title.trim()) {
    return "Укажите название товара";
  }

  if (!form.category.trim()) {
    return "Укажите категорию";
  }

  const requiredPrices: Array<[keyof CatalogItemFormState, string]> = [
    ["price_per_3h", UI_COPY.operator.price3hLabel],
    ["price_per_24h", UI_COPY.operator.price24hLabel],
    ["price_per_7d", UI_COPY.operator.price7dLabel],
  ];

  for (const [field, label] of requiredPrices) {
    const rawValue = String(form[field]).trim();
    const value = Number(rawValue);

    if (!rawValue) {
      return `Укажите ${label.toLowerCase()}`;
    }

    if (Number.isNaN(value) || value < 0) {
      return `${label} должна быть числом не ниже 0`;
    }
  }

  const sortOrder = Number(form.sort_order);

  if (!form.sort_order.trim() || Number.isNaN(sortOrder) || sortOrder < 0) {
    return "Порядок отображения должен быть числом не ниже 0";
  }

  const imageUrl = form.image_url.trim();

  if (imageUrl && !/^https?:\/\/.+/.test(imageUrl)) {
    return "URL изображения должен начинаться с http:// или https://";
  }

  return null;
}

export function filterCatalogItems(
  items: BackendItemDto[],
  filter: CatalogFilter,
): BackendItemDto[] {
  switch (filter) {
    case "active":
      return items.filter((item) => item.is_active);
    case "hidden":
      return items.filter((item) => !item.is_active);
    case "paused":
      return items.filter((item) => item.is_active && !item.is_available);
    case "all":
      return items;
  }
}
