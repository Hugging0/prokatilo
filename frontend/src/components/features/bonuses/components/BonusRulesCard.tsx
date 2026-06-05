import { BadgeCheck, Gift, Percent } from "lucide-react";

import { AppCard } from "@/components/ui/AppCard";
import { AppInfoRow } from "@/components/ui/AppInfoRow";
import { UI_COPY } from "@/lib/copy";

export function BonusRulesCard() {
  return (
    <AppCard className="flex flex-col gap-4">
      <h2 className="text-lg font-black tracking-tight text-slate-950">
        {UI_COPY.bonus.rulesTitle}
      </h2>
      <AppInfoRow icon={Percent} label="Начисление" value={UI_COPY.bonus.ruleEarn} />
      <AppInfoRow
        icon={BadgeCheck}
        label="Списание"
        value={UI_COPY.bonus.ruleSpend}
      />
      <AppInfoRow icon={Gift} label="Промокоды" value={UI_COPY.bonus.rulePromo} />
    </AppCard>
  );
}
