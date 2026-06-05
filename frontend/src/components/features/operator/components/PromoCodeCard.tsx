import { AppBadge } from "@/components/ui/AppBadge";
import { AppButton } from "@/components/ui/AppButton";
import { AppCard } from "@/components/ui/AppCard";
import { UI_COPY } from "@/lib/copy";
import type { AppPromoCode } from "@/types";

function getPromoCodeValue(promoCode: AppPromoCode): string {
  if (promoCode.kind === "percent_discount") {
    return `${promoCode.discountPercent ?? 0}%`;
  }

  if (promoCode.kind === "fixed_discount") {
    return `${promoCode.discountAmount ?? 0} ₽`;
  }

  return `${promoCode.bonusAmount ?? 0} бонусов`;
}

export function PromoCodeCard({
  promoCode,
  onEdit,
  onArchive,
}: {
  promoCode: AppPromoCode;
  onEdit: () => void;
  onArchive: () => void;
}) {
  return (
    <AppCard variant="dark" className="flex flex-col gap-4 text-white">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase tracking-widest text-white/50">
            {promoCode.code}
          </p>
          <h3 className="mt-1 text-lg font-black tracking-tight">
            {promoCode.title}
          </h3>
          <p className="mt-1 text-sm font-bold leading-relaxed text-white/50">
            {getPromoCodeValue(promoCode)} · использовано {promoCode.usedCount}
            {promoCode.maxUses ? `/${promoCode.maxUses}` : ""}
          </p>
        </div>
        <AppBadge>{promoCode.isActive ? "Активен" : "Отключен"}</AppBadge>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <AppButton type="button" variant="secondary" onClick={onEdit}>
          {UI_COPY.operator.editPromoCode}
        </AppButton>
        <AppButton
          type="button"
          variant="danger"
          onClick={onArchive}
          disabled={!promoCode.isActive}
        >
          {UI_COPY.operator.archivePromoCode}
        </AppButton>
      </div>
    </AppCard>
  );
}
