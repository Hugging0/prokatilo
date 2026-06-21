import type { FormEvent } from "react";

import { AppButton } from "@/components/ui/AppButton";
import { AppCard } from "@/components/ui/AppCard";
import { UI_COPY } from "@/lib/copy";
import { ITEM_ICON_KEYS } from "@/lib/mappers/items";
import type { CatalogItemFormState } from "@/types";

interface CatalogItemFormProps {
  form: CatalogItemFormState;
  isEditing: boolean;
  onFieldChange: (
    field: keyof CatalogItemFormState,
    value: string | boolean,
  ) => void;
  onCancel: () => void;
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
  onCancel,
  onSubmit,
}: CatalogItemFormProps) {
  return (
    <AppCard>
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-black tracking-tight text-slate-950">
            {isEditing
              ? UI_COPY.operator.editItemTitle
              : UI_COPY.operator.newItemTitle}
          </h3>
          <p className="mt-2 text-base font-bold leading-relaxed text-slate-500">
            Форма открывается только для добавления или редактирования товара.
          </p>
        </div>
        <AppButton type="button" variant="secondary" size="sm" onClick={onCancel}>
          Закрыть
        </AppButton>
      </div>

      <form onSubmit={onSubmit} className="mt-5 flex flex-col gap-4">
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

        <AppButton type="submit" fullWidth>
          {isEditing ? UI_COPY.operator.saveChanges : UI_COPY.operator.createItem}
        </AppButton>
      </form>
    </AppCard>
  );
}
