import { useState } from "react";
import { CalendarClock, ChevronDown, MapPin, Phone } from "lucide-react";

import { AppBadge } from "@/components/ui/AppBadge";
import { AppButton } from "@/components/ui/AppButton";
import { AppCard } from "@/components/ui/AppCard";
import { formatRentalPeriod } from "@/lib/booking-time";
import { UI_COPY } from "@/lib/copy";
import { ORDER_STATUSES } from "@/lib/order-statuses";
import {
  PAYMENT_STATUS_CLASSES,
  PAYMENT_STATUS_LABELS,
} from "@/lib/payment-statuses";
import { getTariffLabel } from "@/lib/tariffs";
import type { AppOrder, OrderStatus } from "@/types";

import { canCancelOrder, getPrimaryOrderAction } from "../lib/operator-actions";
import { getOperatorNextStep } from "../lib/operator-next-step";

export function OperatorOrderCard({
  order,
  onUpdateStatus,
}: {
  order: AppOrder;
  onUpdateStatus: (orderId: number, status: OrderStatus) => void;
}) {
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const primaryAction = getPrimaryOrderAction(order);

  return (
    <AppCard className="flex flex-col gap-4">
      <div className="flex items-start gap-4">
        <div
          className={`flex size-14 shrink-0 items-center justify-center rounded-2xl ${order.bg} ${order.color}`}
        >
          <order.icon size={24} />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h4 className="text-lg font-black leading-snug text-slate-950">
              #{order.id} · {order.title}
            </h4>
            <AppBadge>{ORDER_STATUSES[order.status].operatorLabel}</AppBadge>
          </div>
          <p className="mt-1 text-base font-bold leading-relaxed text-slate-600">
            {UI_COPY.operator.clientLabel}: {order.customerName}
          </p>
          <div className="mt-3 grid gap-2 text-sm font-bold leading-relaxed text-slate-500">
            <p className="flex items-start gap-2">
              <Phone size={16} className="mt-1 shrink-0" />
              {order.customerPhone}
            </p>
            <p className="flex items-start gap-2">
              <MapPin size={16} className="mt-1 shrink-0" />
              {order.deliveryAddress}
            </p>
            <p className="flex items-start gap-2">
              <CalendarClock size={16} className="mt-1 shrink-0" />
              {formatRentalPeriod(order.rentalStartAt, order.rentalEndAt)}
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <span
          className={`rounded-full px-3 py-2 text-xs font-black ${PAYMENT_STATUS_CLASSES[order.paymentStatus]}`}
        >
          Оплата: {PAYMENT_STATUS_LABELS[order.paymentStatus]}
        </span>
        <span className="rounded-full bg-slate-100 px-3 py-2 text-xs font-black text-slate-600">
          Аренда: {ORDER_STATUSES[order.status].operatorLabel}
        </span>
      </div>

      <div className="rounded-2xl bg-slate-50 p-4 text-sm font-bold leading-relaxed text-slate-600">
        <span className="font-black text-slate-950">Следующий шаг:</span>{" "}
        {getOperatorNextStep(order)}
      </div>

      <div className="grid gap-2 sm:grid-cols-2">
        <a
          href={`tel:${order.customerPhone}`}
          className="inline-flex min-h-14 items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 text-base font-black text-slate-700 shadow-sm transition active:scale-95"
        >
          <Phone size={18} />
          Позвонить
        </a>
        {primaryAction && (
          <AppButton
            type="button"
            onClick={() => onUpdateStatus(order.id, primaryAction.nextStatus)}
          >
            {primaryAction.label}
          </AppButton>
        )}
      </div>

      {canCancelOrder(order) && (
        <AppButton
          type="button"
          variant="danger"
          onClick={() => onUpdateStatus(order.id, "cancelled")}
          fullWidth
        >
          Отменить
        </AppButton>
      )}

      <button
        type="button"
        onClick={() => setIsDetailsOpen((current) => !current)}
        className="inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 text-sm font-black text-slate-600"
      >
        Подробнее
        <ChevronDown
          size={18}
          className={`transition ${isDetailsOpen ? "rotate-180" : ""}`}
        />
      </button>

      {isDetailsOpen && (
        <div className="grid gap-2 rounded-2xl bg-slate-50 p-4 text-sm font-bold leading-relaxed text-slate-600">
          <p>Email: {order.customerEmail || "Не указан"}</p>
          <p>Комментарий: {order.comment || "Нет комментария"}</p>
          <p>Сумма: {order.price} ₽</p>
          <p>Тариф: {getTariffLabel(order.tariff)}</p>
          <p>
            Создано:{" "}
            {new Intl.DateTimeFormat("ru-RU", {
              day: "numeric",
              month: "long",
              hour: "2-digit",
              minute: "2-digit",
            }).format(new Date(order.createdAt))}
          </p>
          <p>
            Статусы: аренда {order.status}, оплата {order.paymentStatus}
          </p>
        </div>
      )}
    </AppCard>
  );
}
