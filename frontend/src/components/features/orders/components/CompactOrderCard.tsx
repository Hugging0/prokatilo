import { ChevronRight } from "lucide-react";

import type { AppOrder } from "@/types";

import { getOrderPrimaryMessage } from "../lib/order-primary-message";
import { formatOrderPrice } from "../lib/orders-view.utils";
import { OrderIcon } from "./OrderIcon";
import { StatusBadge } from "./StatusBadge";

export function CompactOrderCard({
  order,
  onOpen,
}: {
  order: AppOrder;
  onOpen: () => void;
}) {
  const message = getOrderPrimaryMessage(order);

  return (
    <button
      type="button"
      onClick={onOpen}
      className="w-full rounded-[1.4rem] border border-slate-100 bg-white p-4 text-left shadow-sm transition active:scale-[0.99]"
    >
      <div className="flex items-center gap-3">
        <OrderIcon order={order} compact />

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <h3 className="truncate text-base font-black leading-snug text-slate-950">
              {order.title}
            </h3>
            <span className="shrink-0 text-sm font-black text-slate-700">
              {formatOrderPrice(order)}
            </span>
          </div>

          <p className="mt-1 truncate text-sm font-bold text-slate-500">
            {message.title}
          </p>

          <div className="mt-3">
            <StatusBadge status={order.status} />
          </div>
        </div>

        <ChevronRight className="shrink-0 text-slate-300" size={19} />
      </div>
    </button>
  );
}
