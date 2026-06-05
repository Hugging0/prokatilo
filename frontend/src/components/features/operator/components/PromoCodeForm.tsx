import { useState } from "react";
import type { ReactNode } from "react";

import { AppButton } from "@/components/ui/AppButton";
import { AppCard } from "@/components/ui/AppCard";
import { UI_COPY } from "@/lib/copy";
import type { AdminPromoCodePayload, AppPromoCode, PromoCodeKind } from "@/types";

import {
  getPromoCodeInitialForm,
  mapPromoCodeFormToPayload,
  type PromoCodeFormState,
} from "../lib/promo-code-form";

const KIND_OPTIONS: Array<{ value: PromoCodeKind; label: string }> = [
  { value: "percent_discount", label: "Скидка %" },
  { value: "fixed_discount", label: "Скидка ₽" },
  { value: "bonus_credit", label: "Бонусы" },
];

function Field({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <label className="flex flex-col gap-2">
      <span className="text-xs font-black uppercase tracking-widest text-white/50">
        {label}
      </span>
      {children}
    </label>
  );
}

function inputClass() {
  return "min-h-12 rounded-2xl border border-white/10 bg-white/10 px-4 text-base font-bold text-white outline-none placeholder:text-white/30";
}

export function PromoCodeForm({
  promoCode,
  isSubmitting,
  onSubmit,
  onCancel,
}: {
  promoCode: AppPromoCode | null;
  isSubmitting: boolean;
  onSubmit: (payload: AdminPromoCodePayload) => void;
  onCancel: () => void;
}) {
  const [form, setForm] = useState(() => getPromoCodeInitialForm(promoCode));

  const updateField = <K extends keyof PromoCodeFormState>(
    key: K,
    value: PromoCodeFormState[K],
  ) => setForm((current) => ({ ...current, [key]: value }));

  return (
    <AppCard variant="dark" className="mb-5 text-white">
      <h3 className="text-lg font-black tracking-tight">
        {promoCode ? UI_COPY.operator.editPromoCode : UI_COPY.operator.createPromoCode}
      </h3>
      <div className="mt-4 grid gap-3">
        <Field label={UI_COPY.operator.promoCodeLabel}>
          <input
            value={form.code}
            onChange={(event) => updateField("code", event.target.value.toUpperCase())}
            className={inputClass()}
          />
        </Field>
        <Field label={UI_COPY.operator.promoTitleLabel}>
          <input
            value={form.title}
            onChange={(event) => updateField("title", event.target.value)}
            className={inputClass()}
          />
        </Field>
        <Field label={UI_COPY.operator.promoDescriptionLabel}>
          <textarea
            value={form.description}
            onChange={(event) => updateField("description", event.target.value)}
            className={`${inputClass()} min-h-24 py-3`}
          />
        </Field>
        <Field label={UI_COPY.operator.promoKindLabel}>
          <select
            value={form.kind}
            onChange={(event) =>
              updateField("kind", event.target.value as PromoCodeKind)
            }
            className={inputClass()}
          >
            {KIND_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </Field>
        {form.kind === "percent_discount" && (
          <Field label={UI_COPY.operator.discountPercentLabel}>
            <input
              value={form.discountPercent}
              onChange={(event) =>
                updateField("discountPercent", event.target.value)
              }
              inputMode="decimal"
              className={inputClass()}
            />
          </Field>
        )}
        {form.kind === "fixed_discount" && (
          <Field label={UI_COPY.operator.discountAmountLabel}>
            <input
              value={form.discountAmount}
              onChange={(event) =>
                updateField("discountAmount", event.target.value)
              }
              inputMode="decimal"
              className={inputClass()}
            />
          </Field>
        )}
        {form.kind === "bonus_credit" && (
          <Field label={UI_COPY.operator.bonusAmountLabel}>
            <input
              value={form.bonusAmount}
              onChange={(event) => updateField("bonusAmount", event.target.value)}
              inputMode="decimal"
              className={inputClass()}
            />
          </Field>
        )}
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label={UI_COPY.operator.minOrderAmountLabel}>
            <input
              value={form.minOrderAmount}
              onChange={(event) =>
                updateField("minOrderAmount", event.target.value)
              }
              inputMode="decimal"
              className={inputClass()}
            />
          </Field>
          <Field label={UI_COPY.operator.maxUsesLabel}>
            <input
              value={form.maxUses}
              onChange={(event) => updateField("maxUses", event.target.value)}
              inputMode="numeric"
              className={inputClass()}
            />
          </Field>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label={UI_COPY.operator.maxUsesPerUserLabel}>
            <input
              value={form.maxUsesPerUser}
              onChange={(event) =>
                updateField("maxUsesPerUser", event.target.value)
              }
              inputMode="numeric"
              className={inputClass()}
            />
          </Field>
          <label className="flex min-h-12 items-center gap-3 rounded-2xl border border-white/10 bg-white/10 px-4 text-base font-black text-white">
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(event) => updateField("isActive", event.target.checked)}
            />
            {UI_COPY.operator.activePromoLabel}
          </label>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label={UI_COPY.operator.validFromLabel}>
            <input
              type="datetime-local"
              value={form.validFrom}
              onChange={(event) => updateField("validFrom", event.target.value)}
              className={inputClass()}
            />
          </Field>
          <Field label={UI_COPY.operator.validUntilLabel}>
            <input
              type="datetime-local"
              value={form.validUntil}
              onChange={(event) => updateField("validUntil", event.target.value)}
              className={inputClass()}
            />
          </Field>
        </div>
      </div>
      <div className="mt-5 grid grid-cols-2 gap-2">
        <AppButton
          type="button"
          onClick={() => onSubmit(mapPromoCodeFormToPayload(form))}
          disabled={isSubmitting}
        >
          {UI_COPY.operator.saveChanges}
        </AppButton>
        <AppButton type="button" variant="secondary" onClick={onCancel}>
          {UI_COPY.operator.cancelEdit}
        </AppButton>
      </div>
    </AppCard>
  );
}
