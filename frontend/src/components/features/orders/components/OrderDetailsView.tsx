import {
  ArrowLeft,
  CalendarDays,
  Clock3,
  MapPin,
  MoreVertical,
  Phone,
  RefreshCw,
} from "lucide-react";

import { formatRentalPeriod, getRentalDurationLabel } from "@/lib/booking-time";
import { getTariffLabel } from "@/lib/tariffs";
import type { AppOrder } from "@/types";

import {
  getCourierPaymentHint,
  getDeliveryHint,
} from "../lib/order-status-text";
import { DetailRow } from "./DetailRow";
import { OrderActions } from "./OrderActions";
import { OrderProductHeader } from "./OrderProductHeader";
import { ReviewBlock } from "./ReviewBlock";
import { StatusBadge } from "./StatusBadge";
import { StatusInfoBlock } from "./StatusInfoBlock";

export function OrderDetailsView({
  order,
  onBack,
  onLeaveReview,
}: {
  order: AppOrder;
  onBack: () => void;
  onLeaveReview: (orderId: number, rating: number, comment: string) => void;
}) {
  const duration = getRentalDurationLabel(
    new Date(order.rentalStartAt),
    new Date(order.rentalEndAt),
  );

  return (
    <main className="min-h-screen bg-slate-50 px-5 pt-7 pb-32">
      <div className="mx-auto flex max-w-2xl flex-col gap-5">
        <header className="flex items-center justify-between">
          <button
            type="button"
            onClick={onBack}
            className="flex size-12 items-center justify-center rounded-2xl border border-slate-100 bg-white text-slate-800 shadow-sm active:scale-95"
            aria-label="Назад к списку броней"
          >
            <ArrowLeft size={21} />
          </button>
          <button
            type="button"
            className="flex size-12 items-center justify-center rounded-2xl border border-slate-100 bg-white text-slate-500 shadow-sm"
            aria-label="Дополнительные действия"
            disabled
          >
            <MoreVertical size={21} />
          </button>
        </header>

        <section className="rounded-[1.75rem] border border-slate-100 bg-white p-5 shadow-sm">
          <StatusBadge status={order.status} />
          <div className="mt-5">
            <OrderProductHeader order={order} />
          </div>
        </section>

        <section className="rounded-[1.75rem] border border-slate-100 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-5">
            <DetailRow
              icon={CalendarDays}
              label={order.status === "returned" ? "Аренда была" : "Когда"}
              value={formatRentalPeriod(order.rentalStartAt, order.rentalEndAt)}
              hint={`${getTariffLabel(order.tariff)} · ${duration}`}
            />
            <DetailRow
              icon={MapPin}
              label="Доставка"
              value={order.deliveryAddress}
              hint={getDeliveryHint(order.status)}
            />
            <DetailRow
              icon={Phone}
              label="Контакт"
              value={order.customerPhone}
              hint={order.customerName}
            />
            <DetailRow
              icon={Clock3}
              label="Оплата"
              value="Курьеру при получении"
              hint={getCourierPaymentHint(order.status)}
            />
            <DetailRow
              icon={RefreshCw}
              label="Сумма"
              value={`${order.price} ₽`}
              hint="Итог по выбранному периоду аренды"
            />
          </div>
        </section>

        <StatusInfoBlock order={order} />

        {order.status === "returned" && (
          <ReviewBlock order={order} onLeaveReview={onLeaveReview} />
        )}

        <OrderActions order={order} />
      </div>
    </main>
  );
}
