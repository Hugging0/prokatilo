import { AppButton } from "@/components/ui/AppButton";
import { AppCard } from "@/components/ui/AppCard";
import { UI_COPY } from "@/lib/copy";

interface PromoCodeActivationCardProps {
  promoCode: string;
  isActivating: boolean;
  onPromoCodeChange: (value: string) => void;
  onActivate: () => void;
}

export function PromoCodeActivationCard({
  promoCode,
  isActivating,
  onPromoCodeChange,
  onActivate,
}: PromoCodeActivationCardProps) {
  return (
    <AppCard className="flex flex-col gap-4">
      <div>
        <h2 className="text-lg font-black tracking-tight text-slate-950">
          {UI_COPY.bonus.promoTitle}
        </h2>
        <p className="mt-2 text-base font-bold leading-relaxed text-slate-600">
          {UI_COPY.bonus.promoDescription}
        </p>
      </div>
      <input
        value={promoCode}
        onChange={(event) => onPromoCodeChange(event.target.value)}
        placeholder={UI_COPY.bonus.promoPlaceholder}
        className="min-h-14 rounded-2xl border border-slate-200 bg-white px-4 text-base font-black uppercase text-slate-950 outline-none transition focus:border-orange-300"
      />
      <AppButton
        type="button"
        onClick={onActivate}
        disabled={isActivating}
        fullWidth
      >
        {isActivating ? "Активируем…" : UI_COPY.bonus.activateButton}
      </AppButton>
    </AppCard>
  );
}
