import { useEffect, useState } from "react";
import { BadgePercent } from "lucide-react";

import { AppButton } from "@/components/ui/AppButton";
import { AppNotice } from "@/components/ui/AppNotice";
import { getLoyaltySummary } from "@/lib/api/loyalty";
import { previewPromoCode } from "@/lib/api/promo-codes";
import { mapBackendLoyaltySummaryToAppLoyaltySummary } from "@/lib/mappers/loyalty";
import { mapBackendPromoCodePreviewToAppPromoCodePreview } from "@/lib/mappers/promo-codes";
import type { AppLoyaltySummary, AppPromoCodePreview } from "@/types";

import { CheckoutPanel } from "./CheckoutPanel";

interface CheckoutLoyaltyCardProps {
  authToken: string;
  subtotalPrice: number;
  promoCode: string;
  promoDiscountPreview: number;
  bonusSpendAmount: number;
  onNotify: (message: string) => void;
  onPromoCodeChange: (code: string) => void;
  onPromoApplied: (code: string | null, discountAmount: number) => void;
  onBonusSpendChange: (amount: number) => void;
}

export function CheckoutLoyaltyCard({
  authToken,
  subtotalPrice,
  promoCode,
  promoDiscountPreview,
  bonusSpendAmount,
  onNotify,
  onPromoCodeChange,
  onPromoApplied,
  onBonusSpendChange,
}: CheckoutLoyaltyCardProps) {
  const [summary, setSummary] = useState<AppLoyaltySummary | null>(null);
  const [preview, setPreview] = useState<AppPromoCodePreview | null>(null);
  const [isApplying, setIsApplying] = useState(false);
  const maxBonusSpendPercent = summary?.maxBonusSpendPercent ?? 30;
  const maxBonusSpend = Math.floor(
    subtotalPrice * (maxBonusSpendPercent / 100),
  );
  const availableBonusSpend = Math.min(
    Math.floor(summary?.account.balance ?? 0),
    maxBonusSpend,
    Math.max(0, subtotalPrice - promoDiscountPreview),
  );
  const normalizedBonusSpend = Math.min(
    bonusSpendAmount,
    availableBonusSpend,
  );

  useEffect(() => {
    async function loadSummary() {
      if (!authToken) {
        return;
      }

      try {
        const dto = await getLoyaltySummary(authToken);
        setSummary(mapBackendLoyaltySummaryToAppLoyaltySummary(dto));
      } catch {
        setSummary(null);
      }
    }

    void loadSummary();
  }, [authToken]);

  useEffect(() => {
    if (normalizedBonusSpend !== bonusSpendAmount) {
      onBonusSpendChange(normalizedBonusSpend);
    }
  }, [bonusSpendAmount, normalizedBonusSpend, onBonusSpendChange]);

  const applyPromoCode = async () => {
    if (!authToken) {
      onNotify("Войдите, чтобы применить промокод");
      return;
    }

    const normalizedCode = promoCode.trim().toUpperCase();

    if (!normalizedCode) {
      onNotify("Введите промокод");
      return;
    }

    setIsApplying(true);

    try {
      const dto = await previewPromoCode(authToken, {
        code: normalizedCode,
        subtotal_price: subtotalPrice,
      });
      const mappedPreview = mapBackendPromoCodePreviewToAppPromoCodePreview(dto);
      setPreview(mappedPreview);
      onPromoApplied(mappedPreview.code, mappedPreview.discountAmount);
      onPromoCodeChange(mappedPreview.code);
      onNotify(mappedPreview.message);
    } catch (error) {
      setPreview(null);
      onPromoApplied(null, 0);
      onNotify(error instanceof Error ? error.message : "Промокод не применён");
    } finally {
      setIsApplying(false);
    }
  };

  return (
    <CheckoutPanel>
      <div className="flex items-start gap-4">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-orange-50 text-orange-600">
          <BadgePercent size={20} />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-lg font-black tracking-tight text-slate-950">
            Промокод и бонусы
          </h3>
          <p className="mt-1 text-base font-bold leading-relaxed text-slate-500">
            Добавьте промокод или спишите бонусы.
          </p>
        </div>
      </div>

      <div className="mt-5 flex gap-2">
        <input
          value={promoCode}
          onChange={(event) => onPromoCodeChange(event.target.value.toUpperCase())}
          placeholder="Промокод"
          className="min-h-12 min-w-0 flex-1 rounded-2xl border border-slate-200 px-4 text-base font-black uppercase text-slate-950 outline-none focus:border-orange-300"
        />
        <AppButton
          type="button"
          variant="secondary"
          onClick={() => void applyPromoCode()}
          disabled={isApplying}
          className="min-h-12 px-4"
        >
          {isApplying ? "..." : "Применить"}
        </AppButton>
      </div>

      {preview && (
        <AppNotice className="mt-4">
          {preview.message}
        </AppNotice>
      )}

      <div className="mt-5">
        <label className="text-sm font-extrabold text-slate-500">
          Списать бонусы
        </label>
        <input
          type="number"
          min={0}
          max={availableBonusSpend}
          value={bonusSpendAmount || ""}
          onChange={(event) =>
            onBonusSpendChange(Number(event.target.value || 0))
          }
          placeholder={`До ${availableBonusSpend} ₽`}
          className="mt-2 min-h-12 w-full rounded-2xl border border-slate-200 px-4 text-base font-black text-slate-950 outline-none focus:border-orange-300"
        />
        <p className="mt-2 text-sm font-bold leading-relaxed text-slate-500">
          Доступно к списанию: {availableBonusSpend} ₽
          {summary ? `, до ${summary.maxBonusSpendPercent}% суммы` : ""}
        </p>
      </div>
    </CheckoutPanel>
  );
}
