import type { AppOrder } from "@/types";

import { getRentalDurationLabel } from "@/lib/booking-time";
import { formatPricePerDay } from "../lib/orders-view.utils";
import { OrderIcon } from "./OrderIcon";

export function OrderProductHeader({ order }: { order: AppOrder }) {
  const duration = getRentalDurationLabel(
    new Date(order.rentalStartAt),
    new Date(order.rentalEndAt),
  );

  return (
    <div className="flex items-center gap-4">
      <OrderIcon order={order} />
      <div className="min-w-0">
        <h2 className="text-lg font-black leading-snug tracking-tight text-slate-950">
          {order.title}
        </h2>
        <p className="mt-1 text-base font-bold text-slate-500">
          {formatPricePerDay(order)}
        </p>
        <p className="mt-1 text-sm font-bold leading-relaxed text-slate-500">
          {duration}
        </p>
      </div>
    </div>
  );
}
