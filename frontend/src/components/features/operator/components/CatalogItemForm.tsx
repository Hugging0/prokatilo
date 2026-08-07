import type { FormEvent } from "react";
import { useState } from "react";

import { AppButton } from "@/components/ui/AppButton";
import { AppCard } from "@/components/ui/AppCard";
import { UI_COPY } from "@/lib/copy";
import { ITEM_ICON_KEYS } from "@/lib/mappers/items";
import type { CatalogItemFormState } from "@/types";

import { InstructionEditor } from "./InstructionEditor";

interface CatalogItemFormProps {
  form: CatalogItemFormState;
  isEditing: boolean;
  onFieldChange: (
    field: keyof CatalogItemFormState,
    value: string | boolean,
  ) => void;
  onInstructionChange: (
    instruction: CatalogItemFormState["instruction"],
  ) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}

function fieldClass() {
  return "mt-2 min-h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-base font-bold text-slate-950 outline-none transition focus:border-orange-300";
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block text-xs font-black uppercase tracking-widest text-slate-500">
      {label}
      {children}
    </label>
  );
}

export function CatalogItemForm({
  form,
  isEditing,
  onFieldChange,
  onInstructionChange,
  onSubmit,
}: CatalogItemFormProps) {
  const [activeTab, setActiveTab] = useState<"item" | "instruction">("item");

  return (
    <AppCard>
      <div>
        <h3 className="text-lg font-black tracking-tight text-slate-950">
          {isEditing
            ? UI_COPY.operator.editItemTitle
            : UI_COPY.operator.newItemTitle}
        </h3>
        <p className="mt-2 text-base font-bold leading-relaxed text-slate-500">
          {isEditing
            ? "Измените карточку товара или перейдите к его инструкции."
            : "Заполните карточку товара и при необходимости добавьте инструкцию."}
        </p>
      </div>

      <form onSubmit={onSubmit} className="mt-5 flex flex-col gap-4">
        <div className="grid grid-cols-2 rounded-2xl bg-slate-100 p-1">
          <button
            type="button"
            onClick={() => setActiveTab("item")}
            className={`min-h-11 rounded-xl px-3 text-sm font-black transition ${
              activeTab === "item"
                ? "bg-white text-slate-950 shadow-sm"
                : "text-slate-500"
            }`}
          >
            Карточка товара
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("instruction")}
            className={`min-h-11 rounded-xl px-3 text-sm font-black transition ${
              activeTab === "instruction"
                ? "bg-white text-slate-950 shadow-sm"
                : "text-slate-500"
            }`}
          >
            Инструкция
          </button>
        </div>

        <div className={activeTab === "item" ? "contents" : "hidden"}>
        <Field label={UI_COPY.operator.titleLabel}>
          <input
            value={form.title}
            onChange={(event) => onFieldChange("title", event.target.value)}
            className={fieldClass()}
          />
        </Field>

        <Field label={UI_COPY.operator.descriptionLabel}>
          <textarea
            value={form.description}
            onChange={(event) =>
              onFieldChange("description", event.target.value)
            }
            className={`${fieldClass()} min-h-28 py-3`}
          />
        </Field>

        <div className="grid gap-3 sm:grid-cols-2">
          <Field label={UI_COPY.operator.categoryLabel}>
            <input
              value={form.category}
              onChange={(event) =>
                onFieldChange("category", event.target.value)
              }
              className={fieldClass()}
            />
          </Field>

          <Field label={UI_COPY.operator.iconLabel}>
            <select
              value={form.icon_key}
              onChange={(event) =>
                onFieldChange("icon_key", event.target.value)
              }
              className={fieldClass()}
            >
              {ITEM_ICON_KEYS.map((iconKey) => (
                <option key={iconKey} value={iconKey}>
                  {iconKey}
                </option>
              ))}
            </select>
          </Field>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <Field label={UI_COPY.operator.price3hLabel}>
            <input
              value={form.price_per_3h}
              onChange={(event) =>
                onFieldChange("price_per_3h", event.target.value)
              }
              inputMode="decimal"
              className={fieldClass()}
            />
          </Field>
          <Field label={UI_COPY.operator.price24hLabel}>
            <input
              value={form.price_per_24h}
              onChange={(event) =>
                onFieldChange("price_per_24h", event.target.value)
              }
              inputMode="decimal"
              className={fieldClass()}
            />
          </Field>
          <Field label={UI_COPY.operator.price7dLabel}>
            <input
              value={form.price_per_7d}
              onChange={(event) =>
                onFieldChange("price_per_7d", event.target.value)
              }
              inputMode="decimal"
              className={fieldClass()}
            />
          </Field>
        </div>

        <Field label={UI_COPY.operator.imageUrlLabel}>
          <input
            value={form.image_url}
            onChange={(event) => onFieldChange("image_url", event.target.value)}
            placeholder="https://..."
            className={fieldClass()}
          />
        </Field>

        <Field label={UI_COPY.operator.sortOrderLabel}>
          <input
            value={form.sort_order}
            onChange={(event) => onFieldChange("sort_order", event.target.value)}
            inputMode="numeric"
            className={fieldClass()}
          />
        </Field>

        <div className="grid gap-3 sm:grid-cols-2">
          <label className="flex items-start gap-3 rounded-2xl border border-slate-100 bg-slate-50 p-4">
            <input
              type="checkbox"
              checked={form.is_active}
              onChange={(event) =>
                onFieldChange("is_active", event.target.checked)
              }
              className="mt-1"
            />
            <span>
              <span className="block text-base font-black text-slate-950">
                {UI_COPY.operator.activeLabel}
              </span>
              <span className="mt-1 block text-sm font-bold leading-relaxed text-slate-500">
                Клиент видит товар в каталоге.
              </span>
            </span>
          </label>

          <label className="flex items-start gap-3 rounded-2xl border border-slate-100 bg-slate-50 p-4">
            <input
              type="checkbox"
              checked={form.is_available}
              onChange={(event) =>
                onFieldChange("is_available", event.target.checked)
              }
              className="mt-1"
            />
            <span>
              <span className="block text-base font-black text-slate-950">
                {UI_COPY.operator.availableLabel}
              </span>
              <span className="mt-1 block text-sm font-bold leading-relaxed text-slate-500">
                Товар можно бронировать сейчас.
              </span>
            </span>
          </label>
        </div>
        </div>

        <div className={activeTab === "instruction" ? "block" : "hidden"}>
          <InstructionEditor
            instruction={form.instruction}
            isPublished={form.instruction_is_published}
            onChange={onInstructionChange}
            onPublishedChange={(isPublished) =>
              onFieldChange("instruction_is_published", isPublished)
            }
          />
        </div>

        <AppButton type="submit" fullWidth>
          {isEditing ? UI_COPY.operator.saveChanges : UI_COPY.operator.createItem}
        </AppButton>
      </form>
    </AppCard>
  );
}
