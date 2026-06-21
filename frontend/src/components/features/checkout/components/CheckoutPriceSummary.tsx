import { ReceiptText } from "lucide-react";

import { CheckoutPanel } from "./CheckoutPanel";
import { SummaryRow } from "./SummaryRow";

interface CheckoutPriceSummaryProps {
  subtotalPrice: number;
  deliveryPriceLabel: string;
  includeDeliveryInTotal: boolean;
  appliedPromoCode: string | null;
  promoDiscountPreview: number;
  bonusSpendAmount: number;
}

function formatMoney(amount: number) {
  return `${amount.toLocaleString("ru-RU")} ₽`;
}

export function CheckoutPriceSummary({
  subtotalPrice,
  deliveryPriceLabel,
  includeDeliveryInTotal,
  appliedPromoCode,
  promoDiscountPreview,
  bonusSpendAmount,
}: CheckoutPriceSummaryProps) {
  const normalizedPromoDiscount =
    appliedPromoCode && promoDiscountPreview > 0 ? promoDiscountPreview : 0;
  const normalizedBonusSpend =
    bonusSpendAmount > 0 ? bonusSpendAmount : 0;
  const totalToPay = Math.max(
    0,
    subtotalPrice - normalizedPromoDiscount - normalizedBonusSpend,
  );
  const totalLabel = includeDeliveryInTotal
    ? formatMoney(totalToPay)
    : `${formatMoney(totalToPay)} + доставка`;

  return (
    <CheckoutPanel>
      <div className="flex items-start gap-4">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-orange-50 text-orange-600">
          <ReceiptText size={20} />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-lg font-black tracking-tight text-slate-950">
            Итого
          </h3>
          <p className="mt-1 text-base font-bold leading-relaxed text-slate-500">
            Сумма к оплате при получении товара.
          </p>
        </div>
      </div>

      <div className="mt-5">
        <SummaryRow label="Аренда" value={formatMoney(subtotalPrice)} />
        <SummaryRow label="Доставка" value={deliveryPriceLabel} />
        {normalizedPromoDiscount > 0 && (
          <SummaryRow
            label={`Промокод ${appliedPromoCode}`}
            value={`−${formatMoney(normalizedPromoDiscount)}`}
          />
        )}
        {normalizedBonusSpend > 0 && (
          <SummaryRow
            label="Бонусы"
            value={`−${formatMoney(normalizedBonusSpend)}`}
          />
        )}
        <SummaryRow
          label="К оплате курьеру"
          value={totalLabel}
          strong
        />
      </div>
    </CheckoutPanel>
  );
}
