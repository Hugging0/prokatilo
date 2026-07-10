import { Gift } from "lucide-react";

import { AppCard } from "@/components/ui/AppCard";
import { BRAND_GRADIENT } from "@/lib/brand";
import { UI_COPY } from "@/lib/copy";

import { formatBonusAmount } from "../lib/bonus-formatters";

function getBonusRateHint(rate: number) {
  if (rate === 1) {
    return "1 бонус = 1 ₽";
  }

  return `${rate} бонусов = 1 ₽`;
}

export function BonusBalanceCard({
  balance,
  cashbackPercent,
  bonusToRubleRate,
}: {
  balance: number;
  cashbackPercent: number;
  bonusToRubleRate: number;
}) {
  return (
    <AppCard variant="hero" className="overflow-hidden">
      <div className={`mb-5 flex size-14 items-center justify-center rounded-3xl ${BRAND_GRADIENT} text-white shadow-lg`}>
        <Gift size={25} />
      </div>
      <p className="text-sm font-black uppercase tracking-widest text-slate-500">
        Возвращаем {cashbackPercent}% бонусами
      </p>
      <h1 className="mt-2 text-3xl font-black leading-tight tracking-tight text-slate-950">
        Бонусы ПРОКАТило
      </h1>
      <div className="mt-6 rounded-[1.5rem] bg-slate-50 p-5">
        <p className="text-4xl font-black tracking-tight text-slate-950">
          {formatBonusAmount(balance)}
        </p>
        <p className="mt-2 text-base font-bold leading-relaxed text-slate-600">
          {UI_COPY.bonus.balanceMeta}
        </p>
        <p className="mt-1 text-sm font-bold leading-relaxed text-slate-500">
          {getBonusRateHint(bonusToRubleRate)}
        </p>
      </div>
    </AppCard>
  );
}
