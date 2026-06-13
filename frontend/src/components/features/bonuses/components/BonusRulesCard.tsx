import { BadgeCheck, Gift, Percent } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { AppCard } from "@/components/ui/AppCard";
import { UI_COPY } from "@/lib/copy";

export function BonusRulesCard() {
  return (
    <AppCard className="flex flex-col gap-4">
      <h2 className="text-lg font-black tracking-tight text-slate-950">
        {UI_COPY.bonus.rulesTitle}
      </h2>
      <BonusRuleRow icon={Percent} value={UI_COPY.bonus.ruleEarn} />
      <BonusRuleRow icon={BadgeCheck} value={UI_COPY.bonus.ruleSpend} />
      <BonusRuleRow icon={Gift} value={UI_COPY.bonus.rulePromo} />
    </AppCard>
  );
}

function BonusRuleRow({
  icon: Icon,
  value,
}: {
  icon: LucideIcon;
  value: string;
}) {
  return (
    <div className="flex items-start gap-4">
      <div className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-slate-50 text-slate-500">
        <Icon size={19} />
      </div>
      <p className="pt-2 text-base font-black leading-relaxed text-slate-900">
        {value}
      </p>
    </div>
  );
}
