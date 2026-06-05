import { AppCard } from "@/components/ui/AppCard";
import type { AppOrder } from "@/types";

import { ORDER_DETAILS_COPY } from "../lib/order-details-copy";

export function OrderNextSteps({ order }: { order: AppOrder }) {
  const steps = ORDER_DETAILS_COPY.nextSteps[order.status];

  return (
    <AppCard>
      <h2 className="text-lg font-black tracking-tight text-slate-950">
        Что дальше
      </h2>
      <div className="mt-5 flex flex-col gap-3">
        {steps.map((step, index) => (
          <div key={step} className="flex items-start gap-3">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-slate-950 text-sm font-black text-white">
              {index + 1}
            </span>
            <p className="pt-1 text-base font-bold leading-relaxed text-slate-700">
              {step}
            </p>
          </div>
        ))}
      </div>
    </AppCard>
  );
}
