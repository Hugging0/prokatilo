"use client";

import type { FormEvent } from "react";
import { useCallback, useEffect, useMemo, useState } from "react";

import { AppButton } from "@/components/ui/AppButton";
import { AppEmptyState } from "@/components/ui/AppEmptyState";
import { AppNotice } from "@/components/ui/AppNotice";
import { AppSectionHeader } from "@/components/ui/AppSectionHeader";
import {
  archiveAdminItem,
  createAdminItem,
  deleteAdminItem,
  getAdminItems,
  setAdminItemAvailability,
  updateAdminItem,
} from "@/lib/api/admin-items";
import { UI_COPY } from "@/lib/copy";
import type { BackendItemDto, CatalogItemFormState } from "@/types";

import { CatalogItemCard } from "./components/CatalogItemCard";
import { CatalogItemForm } from "./components/CatalogItemForm";
import {
  CATALOG_FILTERS,
  EMPTY_CATALOG_FORM,
  filterCatalogItems,
  normalizeCatalogPayload,
  toCatalogFormState,
  validateCatalogForm,
  type CatalogFilter,
} from "./lib/catalog-form.utils";

interface CatalogManagementProps {
  token: string;
  onCatalogChanged: () => Promise<void>;
}

export function CatalogManagement({
  token,
  onCatalogChanged,
}: CatalogManagementProps) {
  const [items, setItems] = useState<BackendItemDto[]>([]);
  const [form, setForm] = useState<CatalogItemFormState>(EMPTY_CATALOG_FORM);
  const [editingItemId, setEditingItemId] = useState<number | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState<CatalogFilter>("all");
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);
  const visibleItems = useMemo(
    () => filterCatalogItems(items, activeFilter),
    [activeFilter, items],
  );

  const refreshItems = useCallback(async () => {
    setIsLoading(true);
    setMessage(null);

    try {
      setItems(await getAdminItems(token));
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : UI_COPY.operator.catalogLoadError,
      );
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    void Promise.resolve().then(() => refreshItems());
  }, [refreshItems]);

  const updateField = (
    field: keyof CatalogItemFormState,
    value: string | boolean,
  ) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const openNewForm = () => {
    setEditingItemId(null);
    setForm(EMPTY_CATALOG_FORM);
    setMessage(null);
    setIsFormOpen(true);
  };

  const openEditForm = (item: BackendItemDto) => {
    setEditingItemId(item.id);
    setForm(toCatalogFormState(item));
    setMessage(null);
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setEditingItemId(null);
    setForm(EMPTY_CATALOG_FORM);
    setIsFormOpen(false);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const validationError = validateCatalogForm(form);

    if (validationError) {
      setMessage(validationError);
      return;
    }

    try {
      const payload = normalizeCatalogPayload(form);

      if (editingItemId) {
        await updateAdminItem(token, editingItemId, payload);
      } else {
        await createAdminItem(token, payload);
      }

      closeForm();
      await refreshItems();
      await onCatalogChanged();
      setMessage("Каталог обновлён");
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Не удалось сохранить товар",
      );
    }
  };

  const toggleArchive = async (item: BackendItemDto) => {
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

  const toggleAvailability = async (item: BackendItemDto) => {
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

  const deleteItem = async (item: BackendItemDto) => {
    const shouldDelete = window.confirm(
      `Удалить «${item.title}» из каталога? Если по вещи уже были брони, она будет скрыта из каталога.`,
    );

    if (!shouldDelete) {
      return;
    }

    try {
      await deleteAdminItem(token, item.id);
      await refreshItems();
      await onCatalogChanged();
      setMessage("Товар удалён из каталога");
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Не удалось удалить товар",
      );
    }
  };

  return (
    <section className="flex flex-col gap-5">
      <AppSectionHeader
        title={UI_COPY.operator.catalogTitle}
        meta={
          <AppButton type="button" size="sm" onClick={openNewForm}>
            {UI_COPY.operator.addItem}
          </AppButton>
        }
      />

      <div className="flex gap-2 overflow-x-auto pb-1">
        {CATALOG_FILTERS.map((filter) => (
          <button
            key={filter.id}
            type="button"
            onClick={() => setActiveFilter(filter.id)}
            className={`min-h-11 rounded-2xl px-4 text-sm font-black transition ${
              activeFilter === filter.id
                ? "bg-slate-950 text-white"
                : "border border-slate-200 bg-white text-slate-500"
            }`}
          >
            {filter.label}
          </button>
        ))}
      </div>

      {isFormOpen && (
        <CatalogItemForm
          form={form}
          isEditing={Boolean(editingItemId)}
          onFieldChange={updateField}
          onCancel={closeForm}
          onSubmit={handleSubmit}
        />
      )}

      {isLoading && <AppNotice>Загружаем товары…</AppNotice>}

      {message && <AppNotice>{message}</AppNotice>}

      <div className="flex flex-col gap-3">
        {visibleItems.map((item) => (
          <CatalogItemCard
            key={item.id}
            item={item}
            onEdit={() => openEditForm(item)}
            onArchiveToggle={() => void toggleArchive(item)}
            onAvailabilityToggle={() => void toggleAvailability(item)}
            onDelete={() => void deleteItem(item)}
          />
        ))}

        {!isLoading && visibleItems.length === 0 && (
          <AppEmptyState
            title="Товаров пока нет"
            description="В выбранном фильтре пока нет товаров."
            action={
              <AppButton type="button" onClick={openNewForm}>
                {UI_COPY.operator.addItem}
              </AppButton>
            }
          />
        )}
      </div>
    </section>
  );
}
