import type { AppOrder } from "@/types";

import { formatPricePerDay } from "../lib/orders-view.utils";
import { OrderIcon } from "./OrderIcon";

export function OrderProductHeader({ order }: { order: AppOrder }) {
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
      </div>
    </div>
  );
}
