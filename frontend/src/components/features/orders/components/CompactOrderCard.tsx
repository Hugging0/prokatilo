import { CalendarDays, ChevronRight, MapPin } from "lucide-react";

import { formatRentalPeriod } from "@/lib/booking-time";
import { ORDER_STATUSES } from "@/lib/order-statuses";
import type { AppOrder } from "@/types";

import { formatPricePerDay } from "../lib/orders-view.utils";
import { OrderIcon } from "./OrderIcon";
import { StatusBadge } from "./StatusBadge";

export function CompactOrderCard({
  order,
  onOpen,
}: {
  order: AppOrder;
  onOpen: () => void;
}) {
  const status = ORDER_STATUSES[order.status];

  return (
    <button
      type="button"
      onClick={onOpen}
      className="w-full rounded-[1.5rem] border border-slate-100 bg-white p-4 text-left shadow-sm active:scale-[0.99]"
    >
      <div className="flex items-start gap-4">
        <OrderIcon order={order} compact />
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h3 className="truncate text-base font-black leading-snug text-slate-950">
                {order.title}
              </h3>
              <p className="mt-1 text-sm font-bold text-slate-500">
                {formatPricePerDay(order)}
              </p>
            </div>
            <ChevronRight className="mt-1 shrink-0 text-slate-300" size={19} />
          </div>
          <div className="mt-3">
            <StatusBadge status={order.status} />
          </div>
          <div className="mt-4 flex flex-col gap-2 text-sm font-bold text-slate-600">
            <span className="flex items-start gap-2">
              <CalendarDays className="mt-0.5 shrink-0 text-slate-400" size={17} />
              {formatRentalPeriod(order.rentalStartAt, order.rentalEndAt)}
            </span>
            <span className="flex items-start gap-2">
              <MapPin className="mt-0.5 shrink-0 text-slate-400" size={17} />
              <span>{order.deliveryAddress}</span>
            </span>
          </div>
          <p className="mt-3 text-sm font-bold leading-relaxed text-slate-500">
            {status.description}
          </p>
        </div>
      </div>
    </button>
  );
}
