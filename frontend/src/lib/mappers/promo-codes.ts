import type {
  AppPromoCode,
  AppPromoCodePreview,
  BackendPromoCodeDto,
  BackendPromoCodePreviewDto,
} from "@/types";

function parseOptionalNumber(value: string | null): number | null {
  return value === null ? null : Number(value);
}

export function mapBackendPromoCodeToAppPromoCode(
  dto: BackendPromoCodeDto,
): AppPromoCode {
  return {
    id: dto.id,
    code: dto.code,
    title: dto.title,
    description: dto.description,
    kind: dto.kind,
    discountPercent: parseOptionalNumber(dto.discount_percent),
    discountAmount: parseOptionalNumber(dto.discount_amount),
    bonusAmount: parseOptionalNumber(dto.bonus_amount),
    minOrderAmount: parseOptionalNumber(dto.min_order_amount),
    maxUses: dto.max_uses,
    usedCount: dto.used_count,
    maxUsesPerUser: dto.max_uses_per_user,
    validFrom: dto.valid_from,
    validUntil: dto.valid_until,
    isActive: dto.is_active,
    createdAt: dto.created_at,
    updatedAt: dto.updated_at,
  };
}

export function mapBackendPromoCodePreviewToAppPromoCodePreview(
  dto: BackendPromoCodePreviewDto,
): AppPromoCodePreview {
  return {
    code: dto.code,
    title: dto.title,
    description: dto.description,
    kind: dto.kind,
    discountAmount: Number(dto.discount_amount),
    bonusAmount: Number(dto.bonus_amount),
    message: dto.message,
  };
}
