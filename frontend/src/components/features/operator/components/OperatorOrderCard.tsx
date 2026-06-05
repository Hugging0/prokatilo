import { CalendarClock, MapPin, Phone } from "lucide-react";

import { formatRentalPeriod } from "@/lib/booking-time";
import { UI_COPY } from "@/lib/copy";
import {
  ORDER_STATUSES,
  getAllowedNextOrderStatuses,
} from "@/lib/order-statuses";
import {
  PAYMENT_STATUS_CLASSES,
  PAYMENT_STATUS_LABELS,
} from "@/lib/payment-statuses";
import type { AppOrder, OrderStatus } from "@/types";

import { getOperatorNextStep } from "../lib/operator-next-step";

export function OperatorOrderCard({
  order,
  onUpdateStatus,
}: {
  order: AppOrder;
  onUpdateStatus: (orderId: number, status: OrderStatus) => void;
}) {
  return (
    <article className="rounded-[1.75rem] bg-white p-5 text-slate-900 shadow-sm">
      <div className="flex items-start gap-4">
        <div
          className={`flex h-14 w-14 items-center justify-center rounded-2xl ${order.bg} ${order.color}`}
        >
          <order.icon size={24} />
        </div>

        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h4 className="font-black">{order.title}</h4>
            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-black uppercase text-slate-500">
              #{order.id}
            </span>
          </div>
          <p className="text-xs font-bold text-slate-400">
            {UI_COPY.operator.clientLabel}: {order.customerName}
          </p>
          <div className="mt-3 grid gap-2 text-xs font-bold text-slate-500">
            <p className="flex items-start gap-2">
              <Phone size={14} className="mt-0.5 shrink-0" />
              {order.customerPhone}
            </p>
            <p className="flex items-start gap-2">
              <MapPin size={14} className="mt-0.5 shrink-0" />
              {order.deliveryAddress}
            </p>
            <p className="flex items-start gap-2">
              <CalendarClock size={14} className="mt-0.5 shrink-0" />
              {formatRentalPeriod(order.rentalStartAt, order.rentalEndAt)}
            </p>
          </div>
          <p className="mt-2">
            <span
              className={`rounded-full px-2.5 py-1 text-xs font-black ${PAYMENT_STATUS_CLASSES[order.paymentStatus]}`}
            >
              {PAYMENT_STATUS_LABELS[order.paymentStatus]}
            </span>
          </p>
        </div>
      </div>

      <p className="mt-3 text-sm font-bold text-slate-500">
        {ORDER_STATUSES[order.status].description}
      </p>

      <div className="mt-4 rounded-2xl bg-slate-50 p-4 text-xs font-black text-slate-500">
        <span className="text-slate-400">Итого:</span> {order.price}₽ ·{" "}
        <span className="text-slate-400">следующий шаг:</span>{" "}
        {getOperatorNextStep(order)}
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        <span className="rounded-xl bg-slate-900 px-3 py-2 text-xs font-black uppercase text-white shadow-md">
          {ORDER_STATUSES[order.status].operatorLabel}
        </span>

        {getAllowedNextOrderStatuses(order.status).map((status) => (
          <button
            key={status}
            type="button"
            onClick={() => onUpdateStatus(order.id, status)}
            className="rounded-xl bg-slate-100 px-3 py-2 text-xs font-black uppercase text-slate-500 transition-all hover:bg-slate-200"
          >
            {ORDER_STATUSES[status].operatorLabel}
          </button>
        ))}
      </div>
    </article>
  );
}
