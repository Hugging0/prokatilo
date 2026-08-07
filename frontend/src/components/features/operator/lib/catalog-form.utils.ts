import { UI_COPY } from "@/lib/copy";
import type {
  AdminItemFormPayload,
  BackendItemDto,
  CatalogItemFormState,
  ItemInstruction,
} from "@/types";

export const EMPTY_ITEM_INSTRUCTION: ItemInstruction = {
  title: "",
  intro: "",
  sections: [
    {
      title: "",
      steps: [{ title: "", text: "" }],
    },
  ],
  warning: null,
  return_checklist: [],
  manual_url: null,
};

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
  instruction: EMPTY_ITEM_INSTRUCTION,
  instruction_is_published: false,
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
    instruction: item.instruction ?? EMPTY_ITEM_INSTRUCTION,
    instruction_is_published: item.instruction_is_published,
  };
}

function hasInstructionContent(instruction: ItemInstruction): boolean {
  return Boolean(
    instruction.title.trim() ||
      instruction.intro.trim() ||
      instruction.warning?.trim() ||
      instruction.manual_url?.trim() ||
      instruction.return_checklist.some((item) => item.trim()) ||
      instruction.sections.some(
        (section) =>
          section.title.trim() ||
          section.steps.some((step) => step.title.trim() || step.text.trim()),
      ),
  );
}

export function normalizeCatalogPayload(
  form: CatalogItemFormState,
): AdminItemFormPayload {
  const hasInstruction = hasInstructionContent(form.instruction);

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
    instruction: hasInstruction
      ? {
          title: form.instruction.title.trim(),
          intro: form.instruction.intro.trim(),
          sections: form.instruction.sections.map((section) => ({
            title: section.title.trim(),
            steps: section.steps.map((step) => ({
              title: step.title.trim(),
              text: step.text.trim(),
            })),
          })),
          warning: form.instruction.warning?.trim() || null,
          return_checklist: form.instruction.return_checklist
            .map((item) => item.trim())
            .filter(Boolean),
          manual_url: form.instruction.manual_url?.trim() || null,
        }
      : null,
    instruction_is_published:
      hasInstruction && form.instruction_is_published,
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

  if (imageUrl && !/^(?:https?:\/\/|\/).+/.test(imageUrl)) {
    return "Укажите полный URL изображения или локальный путь от /";
  }

  if (hasInstructionContent(form.instruction)) {
    if (!form.instruction.title.trim()) {
      return "Укажите заголовок инструкции";
    }

    if (!form.instruction.intro.trim()) {
      return "Добавьте короткое описание инструкции";
    }

    if (form.instruction.sections.length === 0) {
      return "Добавьте хотя бы один раздел инструкции";
    }

    for (const section of form.instruction.sections) {
      if (!section.title.trim()) {
        return "Укажите название каждого раздела инструкции";
      }

      if (section.steps.length === 0) {
        return `Добавьте шаги в раздел «${section.title}»`;
      }

      for (const step of section.steps) {
        if (!step.title.trim() || !step.text.trim()) {
          return `Заполните название и текст каждого шага в разделе «${section.title}»`;
        }
      }
    }

    const manualUrl = form.instruction.manual_url?.trim();
    if (manualUrl && !/^https?:\/\/.+/.test(manualUrl)) {
      return "Ссылка на руководство должна начинаться с http:// или https://";
    }
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
