import { LayoutDashboard } from "lucide-react";

import { AppCard } from "@/components/ui/AppCard";
import { BRAND_GRADIENT } from "@/lib/brand";
import { UI_COPY } from "@/lib/copy";

export function OperatorHeader() {
  return (
    <AppCard variant="hero" className="flex items-center justify-between gap-4">
      <div className="min-w-0">
        <p className="text-xs font-black uppercase tracking-widest text-slate-500">
          Оператор / Админ
        </p>
        <h2 className="mt-2 text-3xl font-black leading-tight tracking-tight text-slate-950">
          Заявки и управление
        </h2>
        <p className="mt-2 text-base font-bold leading-relaxed text-slate-600">
          {UI_COPY.operator.subtitle}
        </p>
      </div>

      <div
        className={`flex size-14 shrink-0 items-center justify-center rounded-3xl ${BRAND_GRADIENT} text-white shadow-lg`}
      >
        <LayoutDashboard size={25} />
      </div>
    </AppCard>
  );
}
