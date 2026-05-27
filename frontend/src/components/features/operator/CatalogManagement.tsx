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
import {
  clearAdminToken,
  getAdminToken,
  setAdminToken,
} from "@/lib/admin-token";
import { UI_COPY } from "@/lib/copy";
import { ITEM_ICON_KEYS } from "@/lib/mappers/items";
import type { AdminItemFormPayload, BackendItemDto } from "@/types";

const EMPTY_FORM: AdminItemFormPayload = {
  title: "",
  description: "",
  category: "Техника",
  price_per_3h: 0,
  price_per_6h: 0,
  price_per_24h: 0,
  image_url: null,
  icon_key: "package",
  sort_order: 100,
  is_available: true,
  is_active: true,
};

interface CatalogManagementProps {
  onCatalogChanged: () => Promise<void>;
}

function toFormPayload(item: BackendItemDto): AdminItemFormPayload {
  return {
    title: item.title,
    description: item.description ?? "",
    category: item.category,
    price_per_3h: Number(item.price_per_3h),
    price_per_6h: Number(item.price_per_6h),
    price_per_24h: Number(item.price_per_24h),
    image_url: item.image_url,
    icon_key: item.icon_key,
    sort_order: item.sort_order,
    is_available: item.is_available,
    is_active: item.is_active,
  };
}

function normalizePayload(
  payload: AdminItemFormPayload,
): AdminItemFormPayload {
  return {
    ...payload,
    description: payload.description?.trim() || null,
    image_url: payload.image_url?.trim() || null,
    title: payload.title.trim(),
    category: payload.category.trim(),
    icon_key: payload.icon_key.trim() || "package",
  };
}

function validatePayload(payload: AdminItemFormPayload): string | null {
  if (!payload.title.trim()) {
    return "Укажите название товара";
  }

  if (!payload.category.trim()) {
    return "Укажите категорию";
  }

  if (
    payload.price_per_3h < 0 ||
    payload.price_per_6h < 0 ||
    payload.price_per_24h < 0
  ) {
    return "Цены не могут быть отрицательными";
  }

  if (payload.sort_order < 0) {
    return "Порядок не может быть отрицательным";
  }

  if (
    payload.image_url &&
    !/^https?:\/\/\S+\.\S+/.test(payload.image_url)
  ) {
    return "URL изображения должен начинаться с http:// или https://";
  }

  return null;
}

export function CatalogManagement({
  onCatalogChanged,
}: CatalogManagementProps) {
  const [token, setToken] = useState<string | null>(() =>
    getAdminToken(),
  );
  const [tokenInput, setTokenInput] = useState(
    () => getAdminToken() ?? "",
  );
  const [items, setItems] = useState<BackendItemDto[]>([]);
  const [form, setForm] = useState<AdminItemFormPayload>(EMPTY_FORM);
  const [editingItemId, setEditingItemId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(() =>
    Boolean(getAdminToken()),
  );
  const [message, setMessage] = useState<string | null>(null);

  async function refreshItems(activeToken = token) {
    if (!activeToken) {
      return;
    }

    setIsLoading(true);
    setMessage(null);

    try {
      const nextItems = await getAdminItems(activeToken);
      setItems(nextItems);
    } catch {
      setMessage("Не удалось загрузить каталог. Проверьте ключ доступа.");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    if (token) {
      void getAdminItems(token)
        .then((nextItems) => {
          setItems(nextItems);
          setMessage(null);
        })
        .catch(() => {
          setMessage(
            "Не удалось загрузить каталог. Проверьте ключ доступа.",
          );
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [token]);

  const handleSaveToken = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const nextToken = tokenInput.trim();

    if (!nextToken) {
      setMessage("Введите ключ доступа");
      return;
    }

    setAdminToken(nextToken);
    setToken(nextToken);
    void refreshItems(nextToken);
  };

  const handleClearToken = () => {
    clearAdminToken();
    setToken(null);
    setTokenInput("");
    setItems([]);
    setMessage(null);
  };

  const handleEdit = (item: BackendItemDto) => {
    setEditingItemId(item.id);
    setForm(toFormPayload(item));
    setMessage(null);
  };

  const handleNew = () => {
    setEditingItemId(null);
    setForm(EMPTY_FORM);
    setMessage(null);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!token) {
      setMessage("Сначала сохраните ключ доступа");
      return;
    }

    const normalizedPayload = normalizePayload(form);
    const validationError = validatePayload(normalizedPayload);

    if (validationError) {
      setMessage(validationError);
      return;
    }

    try {
      if (editingItemId) {
        await updateAdminItem(token, editingItemId, normalizedPayload);
      } else {
        await createAdminItem(token, normalizedPayload);
      }

      setForm(EMPTY_FORM);
      setEditingItemId(null);
      setMessage("Каталог обновлён");
      await refreshItems(token);
      await onCatalogChanged();
    } catch {
      setMessage("Не удалось сохранить товар");
    }
  };

  const handleArchiveToggle = async (item: BackendItemDto) => {
    if (!token) {
      return;
    }

    try {
      if (item.is_active) {
        await archiveAdminItem(token, item.id);
      } else {
        await updateAdminItem(token, item.id, {
          is_active: true,
        });
      }

      await refreshItems(token);
      await onCatalogChanged();
    } catch {
      setMessage("Не удалось изменить видимость товара");
    }
  };

  const handleAvailabilityToggle = async (item: BackendItemDto) => {
    if (!token) {
      return;
    }

    try {
      await setAdminItemAvailability(
        token,
        item.id,
        !item.is_available,
      );
      await refreshItems(token);
      await onCatalogChanged();
    } catch {
      setMessage("Не удалось изменить доступность товара");
    }
  };

  const handleDelete = async (item: BackendItemDto) => {
    if (!token || !window.confirm("Удалить товар безвозвратно?")) {
      return;
    }

    try {
      await deleteAdminItem(token, item.id);
      await refreshItems(token);
      await onCatalogChanged();
    } catch {
      setMessage("Не удалось удалить товар");
    }
  };

  if (!token) {
    return (
      <section className="rounded-[2rem] bg-white p-5 text-slate-900">
        <h3 className="text-xl font-black">
          {UI_COPY.operator.accessTitle}
        </h3>
        <p className="mt-2 text-sm font-bold text-slate-400">
          {UI_COPY.operator.accessHint}
        </p>

        <form onSubmit={handleSaveToken} className="mt-5 space-y-3">
          <label className="block text-xs font-black uppercase tracking-widest text-slate-400">
            {UI_COPY.operator.accessKeyLabel}
          </label>
          <input
            type="password"
            value={tokenInput}
            onChange={(event) => setTokenInput(event.target.value)}
            className="w-full rounded-2xl border-2 border-slate-100 bg-slate-50 px-4 py-4 text-sm font-bold outline-none focus:border-rose-500"
          />
          <button
            type="submit"
            className="w-full rounded-2xl bg-slate-900 py-4 text-sm font-black text-white"
          >
            {UI_COPY.operator.saveAccessKey}
          </button>
        </form>

        {message && (
          <p className="mt-4 text-xs font-black text-rose-500">
            {message}
          </p>
        )}
      </section>
    );
  }

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="text-xl font-black">
            {UI_COPY.operator.catalogTitle}
          </h3>
          <p className="text-xs font-bold text-white/40">
            {isLoading ? "Загружаем товары…" : `Товаров: ${items.length}`}
          </p>
        </div>

        <button
          type="button"
          onClick={handleClearToken}
          className="rounded-2xl bg-white/10 px-4 py-3 text-[10px] font-black text-white/60"
        >
          {UI_COPY.operator.clearAccessKey}
        </button>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-3 rounded-[2rem] bg-white p-5 text-slate-900"
      >
        <div className="flex items-center justify-between gap-3">
          <h4 className="font-black">
            {editingItemId
              ? UI_COPY.operator.saveItem
              : UI_COPY.operator.addItem}
          </h4>
          <button
            type="button"
            onClick={handleNew}
            className="text-xs font-black text-rose-500"
          >
            {UI_COPY.operator.createItem}
          </button>
        </div>

        <input
          value={form.title}
          onChange={(event) =>
            setForm({ ...form, title: event.target.value })
          }
          placeholder="Название"
          className="w-full rounded-2xl border-2 border-slate-100 bg-slate-50 px-4 py-3 text-sm font-bold outline-none focus:border-rose-500"
        />
        <textarea
          value={form.description ?? ""}
          onChange={(event) =>
            setForm({ ...form, description: event.target.value })
          }
          placeholder="Описание"
          className="min-h-24 w-full rounded-2xl border-2 border-slate-100 bg-slate-50 px-4 py-3 text-sm font-bold outline-none focus:border-rose-500"
        />

        <div className="grid grid-cols-2 gap-3">
          <input
            value={form.category}
            onChange={(event) =>
              setForm({ ...form, category: event.target.value })
            }
            placeholder="Категория"
            className="rounded-2xl border-2 border-slate-100 bg-slate-50 px-4 py-3 text-sm font-bold outline-none focus:border-rose-500"
          />
          <select
            value={form.icon_key}
            onChange={(event) =>
              setForm({ ...form, icon_key: event.target.value })
            }
            className="rounded-2xl border-2 border-slate-100 bg-slate-50 px-4 py-3 text-sm font-bold outline-none focus:border-rose-500"
          >
            {ITEM_ICON_KEYS.map((iconKey) => (
              <option key={iconKey} value={iconKey}>
                {iconKey}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {[
            ["price_per_3h", "3 часа"],
            ["price_per_6h", "6 часов"],
            ["price_per_24h", "сутки"],
          ].map(([field, label]) => (
            <label
              key={field}
              className="text-[10px] font-black text-slate-400"
            >
              {label}
              <input
                type="number"
                min={0}
                value={form[field as keyof AdminItemFormPayload] as number}
                onChange={(event) =>
                  setForm({
                    ...form,
                    [field]: Number(event.target.value),
                  })
                }
                className="mt-1 w-full rounded-2xl border-2 border-slate-100 bg-slate-50 px-3 py-3 text-sm font-bold text-slate-900 outline-none focus:border-rose-500"
              />
            </label>
          ))}
        </div>

        <input
          value={form.image_url ?? ""}
          onChange={(event) =>
            setForm({ ...form, image_url: event.target.value })
          }
          placeholder="URL изображения"
          className="w-full rounded-2xl border-2 border-slate-100 bg-slate-50 px-4 py-3 text-sm font-bold outline-none focus:border-rose-500"
        />

        <label className="block text-[10px] font-black text-slate-400">
          Порядок
          <input
            type="number"
            min={0}
            value={form.sort_order}
            onChange={(event) =>
              setForm({ ...form, sort_order: Number(event.target.value) })
            }
            className="mt-1 w-full rounded-2xl border-2 border-slate-100 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-900 outline-none focus:border-rose-500"
          />
        </label>

        <div className="grid grid-cols-2 gap-3 text-xs font-black text-slate-500">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={form.is_active}
              onChange={(event) =>
                setForm({ ...form, is_active: event.target.checked })
              }
            />
            Показывать
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={form.is_available}
              onChange={(event) =>
                setForm({
                  ...form,
                  is_available: event.target.checked,
                })
              }
            />
            Доступен
          </label>
        </div>

        <button
          type="submit"
          className="w-full rounded-2xl bg-slate-900 py-4 text-sm font-black text-white"
        >
          {editingItemId
            ? UI_COPY.operator.saveItem
            : UI_COPY.operator.createItem}
        </button>
      </form>

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
                className="rounded-xl bg-slate-100 px-3 py-2 text-[10px] font-black text-slate-500"
              >
                {item.is_available ? "Недоступен" : "Доступен"}
              </button>
              <button
                type="button"
                onClick={() => handleDelete(item)}
                className="rounded-xl bg-rose-50 px-3 py-2 text-[10px] font-black text-rose-500"
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
