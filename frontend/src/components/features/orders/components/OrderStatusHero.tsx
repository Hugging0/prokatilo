import { AppCard } from "@/components/ui/AppCard";
import type { AppOrder } from "@/types";

import { ORDER_DETAILS_COPY } from "../lib/order-details-copy";
import { StatusBadge } from "./StatusBadge";

export function OrderStatusHero({ order }: { order: AppOrder }) {
  const copy = ORDER_DETAILS_COPY.statusHero[order.status];

  return (
    <AppCard className="rounded-[2rem] p-6">
      <StatusBadge status={order.status} />
      <h2 className="mt-4 text-2xl font-black leading-tight tracking-tight text-slate-950">
        {copy.title}
      </h2>
      <p className="mt-3 text-base font-bold leading-relaxed text-slate-600">
        {copy.text}
      </p>
    </AppCard>
  );
}
