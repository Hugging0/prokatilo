import type { AdminPromoCodePayload, AppPromoCode, PromoCodeKind } from "@/types";

export interface PromoCodeFormState {
  code: string;
  title: string;
  description: string;
  kind: PromoCodeKind;
  discountPercent: string;
  discountAmount: string;
  bonusAmount: string;
  minOrderAmount: string;
  maxUses: string;
  maxUsesPerUser: string;
  validFrom: string;
  validUntil: string;
  isActive: boolean;
}

export const EMPTY_PROMO_CODE_FORM: PromoCodeFormState = {
  code: "",
  title: "",
  description: "",
  kind: "percent_discount",
  discountPercent: "",
  discountAmount: "",
  bonusAmount: "",
  minOrderAmount: "",
  maxUses: "",
  maxUsesPerUser: "1",
  validFrom: "",
  validUntil: "",
  isActive: true,
};

function numberOrNull(value: string): number | null {
  const normalized = value.trim();
  return normalized ? Number(normalized) : null;
}

function dateOrNull(value: string): string | null {
  return value ? new Date(value).toISOString() : null;
}

export function getPromoCodeInitialForm(
  promoCode: AppPromoCode | null,
): PromoCodeFormState {
  if (!promoCode) {
    return EMPTY_PROMO_CODE_FORM;
  }

  return {
    code: promoCode.code,
    title: promoCode.title,
    description: promoCode.description ?? "",
    kind: promoCode.kind,
    discountPercent: promoCode.discountPercent?.toString() ?? "",
    discountAmount: promoCode.discountAmount?.toString() ?? "",
    bonusAmount: promoCode.bonusAmount?.toString() ?? "",
    minOrderAmount: promoCode.minOrderAmount?.toString() ?? "",
    maxUses: promoCode.maxUses?.toString() ?? "",
    maxUsesPerUser: promoCode.maxUsesPerUser.toString(),
    validFrom: promoCode.validFrom?.slice(0, 16) ?? "",
    validUntil: promoCode.validUntil?.slice(0, 16) ?? "",
    isActive: promoCode.isActive,
  };
}

export function mapPromoCodeFormToPayload(
  form: PromoCodeFormState,
): AdminPromoCodePayload {
  return {
    code: form.code.trim().toUpperCase(),
    title: form.title.trim(),
    description: form.description.trim() || null,
    kind: form.kind,
    discount_percent:
      form.kind === "percent_discount" ? numberOrNull(form.discountPercent) : null,
    discount_amount:
      form.kind === "fixed_discount" ? numberOrNull(form.discountAmount) : null,
    bonus_amount:
      form.kind === "bonus_credit" ? numberOrNull(form.bonusAmount) : null,
    min_order_amount: numberOrNull(form.minOrderAmount),
    max_uses: numberOrNull(form.maxUses),
    max_uses_per_user: numberOrNull(form.maxUsesPerUser) ?? 1,
    valid_from: dateOrNull(form.validFrom),
    valid_until: dateOrNull(form.validUntil),
    is_active: form.isActive,
  };
}
