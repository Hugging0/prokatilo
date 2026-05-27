"use client";

import type { FormEvent } from "react";
import { useEffect, useState } from "react";

import {
  archiveAdminItem,
  createAdminItem,
  deleteAdminItem,
  getAdminItems,
  setAdminItemAvailability,
  updateAdminItem,
} from "@/lib/api/admin-items";
import { UI_COPY } from "@/lib/copy";
import { ITEM_ICON_KEYS } from "@/lib/mappers/items";
import type {
  AdminItemFormPayload,
  BackendItemDto,
  CatalogItemFormState,
} from "@/types";

const EMPTY_FORM: CatalogItemFormState = {
  title: "",
  description: "",
  category: "Техника",
  price_per_3h: "",
  price_per_6h: "",
  price_per_24h: "",
  image_url: "",
  icon_key: "package",
  sort_order: "100",
  is_available: true,
  is_active: true,
};

interface CatalogManagementProps {
  token: string;
  onCatalogChanged: () => Promise<void>;
}

function toFormState(item: BackendItemDto): CatalogItemFormState {
  return {
    title: item.title,
    description: item.description ?? "",
    category: item.category,
    price_per_3h: String(Number(item.price_per_3h)),
    price_per_6h: String(Number(item.price_per_6h)),
    price_per_24h: String(Number(item.price_per_24h)),
    image_url: item.image_url ?? "",
    icon_key: item.icon_key,
    sort_order: String(item.sort_order),
    is_available: item.is_available,
    is_active: item.is_active,
  };
}

function normalizePayload(
  form: CatalogItemFormState,
): AdminItemFormPayload {
  return {
    title: form.title.trim(),
    description: form.description.trim() || null,
    category: form.category.trim(),
    price_per_3h: Number(form.price_per_3h),
    price_per_6h: Number(form.price_per_6h),
    price_per_24h: Number(form.price_per_24h),
    image_url: form.image_url.trim() || null,
    icon_key: form.icon_key.trim() || "package",
    sort_order: Number(form.sort_order),
    is_available: form.is_available,
    is_active: form.is_active,
  };
}

function validatePayload(form: CatalogItemFormState): string | null {
  if (!form.title.trim()) {
    return "Укажите название товара";
  }

  if (!form.category.trim()) {
    return "Укажите категорию";
  }

  if (!form.price_per_3h.trim()) {
    return "Укажите цену за 3 часа";
  }

  if (!form.price_per_6h.trim()) {
    return "Укажите цену за 6 часов";
  }

  if (!form.price_per_24h.trim()) {
    return "Укажите цену за сутки";
  }

  if (!form.sort_order.trim()) {
    return "Укажите порядок отображения";
  }

  const numericValues: Array<{ label: string; value: number }> = [
    {
      label: UI_COPY.operator.price3hLabel,
      value: Number(form.price_per_3h),
    },
    {
      label: UI_COPY.operator.price6hLabel,
      value: Number(form.price_per_6h),
    },
    {
      label: UI_COPY.operator.price24hLabel,
      value: Number(form.price_per_24h),
    },
    {
      label: UI_COPY.operator.sortOrderLabel,
      value: Number(form.sort_order),
    },
  ];

  for (const { label, value } of numericValues) {
    if (Number.isNaN(value)) {
      return `${label} должна быть числом`;
    }

    if (value < 0) {
      return `${label} не может быть отрицательной`;
    }
  }

  if (
    form.image_url.trim() &&
    !/^https?:\/\/\S+\.\S+/.test(form.image_url.trim())
  ) {
    return "URL изображения должен начинаться с http:// или https://";
  }

  return null;
}

function isDirty(
  form: CatalogItemFormState,
  initialForm: CatalogItemFormState,
): boolean {
  return JSON.stringify(form) !== JSON.stringify(initialForm);
}

export function CatalogManagement({
  token,
  onCatalogChanged,
}: CatalogManagementProps) {
  const [items, setItems] = useState<BackendItemDto[]>([]);
  const [form, setForm] = useState<CatalogItemFormState>(EMPTY_FORM);
  const [initialForm, setInitialForm] =
    useState<CatalogItemFormState>(EMPTY_FORM);
  const [editingItemId, setEditingItemId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);

  async function refreshItems() {
    setIsLoading(true);
    setMessage(null);

    try {
      const nextItems = await getAdminItems(token);
      setItems(nextItems);
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : UI_COPY.operator.catalogLoadError,
      );
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    let isMounted = true;

    void getAdminItems(token)
      .then((nextItems) => {
        if (!isMounted) {
          return;
        }

        setItems(nextItems);
      })
      .catch((error) => {
        if (!isMounted) {
          return;
        }

        setMessage(
          error instanceof Error
            ? error.message
            : UI_COPY.operator.catalogLoadError,
        );
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [token]);

  const handleFieldChange = (
    field: keyof CatalogItemFormState,
    value: string | boolean,
  ) => {
    setForm((currentForm) => ({
      ...currentForm,
      [field]: value,
    }));
  };

  const handleEdit = (item: BackendItemDto) => {
    const nextForm = toFormState(item);
    setEditingItemId(item.id);
    setForm(nextForm);
    setInitialForm(nextForm);
    setMessage(null);
  };

  const resetToNewItem = () => {
    setEditingItemId(null);
    setForm(EMPTY_FORM);
    setInitialForm(EMPTY_FORM);
    setMessage(null);
  };

  const handleSecondaryAction = () => {
    if (
      isDirty(form, initialForm) &&
      !window.confirm(UI_COPY.operator.discardChanges)
    ) {
      return;
    }

    resetToNewItem();
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const validationError = validatePayload(form);

    if (validationError) {
      setMessage(validationError);
      return;
    }

    try {
      const normalizedPayload = normalizePayload(form);

      if (editingItemId) {
        await updateAdminItem(token, editingItemId, normalizedPayload);
      } else {
        await createAdminItem(token, normalizedPayload);
      }

      setMessage("Каталог обновлён");
      resetToNewItem();
      await refreshItems();
      await onCatalogChanged();
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Не удалось сохранить товар",
      );
    }
  };

  const handleArchiveToggle = async (item: BackendItemDto) => {
    try {
      if (item.is_active) {
        await archiveAdminItem(token, item.id);
      } else {
        await updateAdminItem(token, item.id, { is_active: true });
      }

      await refreshItems();
      await onCatalogChanged();
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Не удалось изменить видимость товара",
      );
    }
  };

  const handleAvailabilityToggle = async (item: BackendItemDto) => {
    try {
      await setAdminItemAvailability(token, item.id, !item.is_available);
      await refreshItems();
      await onCatalogChanged();
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Не удалось изменить доступность товара",
      );
    }
  };

  const handleDelete = async (item: BackendItemDto) => {
    if (!window.confirm("Удалить товар безвозвратно?")) {
      return;
    }

    try {
      await deleteAdminItem(token, item.id);
      await refreshItems();
      await onCatalogChanged();
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Не удалось удалить товар",
      );
    }
  };

  return (
    <section className="space-y-4">
      <div className="rounded-[2rem] bg-white p-5 text-slate-900">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h3 className="text-xl font-black">
              {editingItemId
                ? UI_COPY.operator.editItemTitle
                : UI_COPY.operator.newItemTitle}
            </h3>
            <p className="mt-1 text-xs font-bold text-slate-400">
              {isLoading ? "Загружаем товары…" : `Товаров: ${items.length}`}
            </p>
          </div>

          <button
            type="button"
            onClick={handleSecondaryAction}
            className="rounded-2xl bg-slate-100 px-4 py-3 text-[10px] font-black text-slate-500"
          >
            {editingItemId
              ? UI_COPY.operator.cancelEdit
              : UI_COPY.operator.newItem}
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-3">
          <label className="block text-[10px] font-black text-slate-400">
            {UI_COPY.operator.titleLabel}
            <input
              value={form.title}
              onChange={(event) =>
                handleFieldChange("title", event.target.value)
              }
              placeholder={UI_COPY.operator.titleLabel}
              className="mt-1 w-full rounded-2xl border-2 border-slate-100 bg-slate-50 px-4 py-3 text-sm font-bold outline-none focus:border-rose-500"
            />
          </label>

          <label className="block text-[10px] font-black text-slate-400">
            {UI_COPY.operator.descriptionLabel}
            <textarea
              value={form.description}
              onChange={(event) =>
                handleFieldChange("description", event.target.value)
              }
              placeholder={UI_COPY.operator.descriptionLabel}
              className="mt-1 min-h-24 w-full rounded-2xl border-2 border-slate-100 bg-slate-50 px-4 py-3 text-sm font-bold outline-none focus:border-rose-500"
            />
          </label>

          <div className="grid grid-cols-2 gap-3">
            <label className="block text-[10px] font-black text-slate-400">
              {UI_COPY.operator.categoryLabel}
              <input
                value={form.category}
                onChange={(event) =>
                  handleFieldChange("category", event.target.value)
                }
                placeholder={UI_COPY.operator.categoryLabel}
                className="mt-1 w-full rounded-2xl border-2 border-slate-100 bg-slate-50 px-4 py-3 text-sm font-bold outline-none focus:border-rose-500"
              />
            </label>

            <label className="block text-[10px] font-black text-slate-400">
              {UI_COPY.operator.iconLabel}
              <select
                value={form.icon_key}
                onChange={(event) =>
                  handleFieldChange("icon_key", event.target.value)
                }
                className="mt-1 w-full rounded-2xl border-2 border-slate-100 bg-slate-50 px-4 py-3 text-sm font-bold outline-none focus:border-rose-500"
              >
                {ITEM_ICON_KEYS.map((iconKey) => (
                  <option key={iconKey} value={iconKey}>
                    {iconKey}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {[
              ["price_per_3h", UI_COPY.operator.price3hLabel],
              ["price_per_6h", UI_COPY.operator.price6hLabel],
              ["price_per_24h", UI_COPY.operator.price24hLabel],
            ].map(([field, label]) => (
              <label
                key={field}
                className="block text-[10px] font-black text-slate-400"
              >
                {label}
                <input
                  type="number"
                  min={0}
                  step="0.01"
                  value={form[field as keyof CatalogItemFormState] as string}
                  onChange={(event) =>
                    handleFieldChange(
                      field as keyof CatalogItemFormState,
                      event.target.value,
                    )
                  }
                  placeholder="0"
                  className="mt-1 w-full rounded-2xl border-2 border-slate-100 bg-slate-50 px-3 py-3 text-sm font-bold text-slate-900 outline-none focus:border-rose-500"
                />
              </label>
            ))}
          </div>

          <label className="block text-[10px] font-black text-slate-400">
            {UI_COPY.operator.imageUrlLabel}
            <input
              value={form.image_url}
              onChange={(event) =>
                handleFieldChange("image_url", event.target.value)
              }
              placeholder={UI_COPY.operator.imageUrlLabel}
              className="mt-1 w-full rounded-2xl border-2 border-slate-100 bg-slate-50 px-4 py-3 text-sm font-bold outline-none focus:border-rose-500"
            />
          </label>

          <label className="block text-[10px] font-black text-slate-400">
            {UI_COPY.operator.sortOrderLabel}
            <input
              type="number"
              min={0}
              value={form.sort_order}
              onChange={(event) =>
                handleFieldChange("sort_order", event.target.value)
              }
              placeholder="100"
              className="mt-1 w-full rounded-2xl border-2 border-slate-100 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-900 outline-none focus:border-rose-500"
            />
          </label>

          <div className="grid grid-cols-1 gap-3 text-xs font-black text-slate-500 sm:grid-cols-2">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={form.is_active}
                onChange={(event) =>
                  handleFieldChange("is_active", event.target.checked)
                }
              />
              {UI_COPY.operator.activeLabel}
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={form.is_available}
                onChange={(event) =>
                  handleFieldChange("is_available", event.target.checked)
                }
              />
              {UI_COPY.operator.availableLabel}
            </label>
          </div>

          <button
            type="submit"
            className="w-full rounded-2xl bg-slate-900 py-4 text-sm font-black text-white"
          >
            {editingItemId
              ? UI_COPY.operator.saveChanges
              : UI_COPY.operator.createItem}
          </button>
        </form>
      </div>

      {message && (
        <p className="rounded-2xl bg-white/10 p-4 text-xs font-black text-white/70">
          {message}
        </p>
      )}

      <div className="space-y-3">
        {items.map((item) => (
          <article
            key={item.id}
            className="rounded-[2rem] bg-white p-5 text-slate-900"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <h4 className="font-black">{item.title}</h4>
                <p className="mt-1 text-xs font-bold text-slate-400">
                  {item.category} • {item.price_per_3h}₽ / 3 часа
                </p>
              </div>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-[10px] font-black text-slate-400">
                {item.icon_key}
              </span>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => handleEdit(item)}
                className="rounded-xl bg-slate-900 px-3 py-2 text-[10px] font-black text-white"
              >
                {UI_COPY.operator.editItem}
              </button>
              <button
                type="button"
                onClick={() => handleArchiveToggle(item)}
                className="rounded-xl bg-slate-100 px-3 py-2 text-[10px] font-black text-slate-500"
              >
                {item.is_active
                  ? UI_COPY.operator.hideItem
                  : UI_COPY.operator.restoreItem}
              </button>
              <button
                type="button"
                onClick={() => handleAvailabilityToggle(item)}
                className={`rounded-xl px-3 py-2 text-[10px] font-black ${
                  item.is_available
                    ? "bg-emerald-100 text-emerald-600"
                    : "bg-amber-100 text-amber-600"
                }`}
              >
                {item.is_available ? "Доступен" : "Недоступен"}
              </button>
              <button
                type="button"
                onClick={() => handleDelete(item)}
                className="rounded-xl bg-rose-100 px-3 py-2 text-[10px] font-black text-rose-500"
              >
                {UI_COPY.operator.deleteItem}
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
