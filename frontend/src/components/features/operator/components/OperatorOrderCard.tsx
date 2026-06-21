import { useState } from "react";
import { CalendarClock, ChevronDown, MapPin, Phone } from "lucide-react";

import { AppButton } from "@/components/ui/AppButton";
import { AppCard } from "@/components/ui/AppCard";
import { formatDateTime, formatDeliveryWindow } from "@/lib/booking-time";
import { UI_COPY } from "@/lib/copy";
import { getTariffLabel } from "@/lib/tariffs";
import type { AppOrder, OrderStatus } from "@/types";

import { canCancelOrder, getPrimaryOrderAction } from "../lib/operator-actions";

export function OperatorOrderCard({
  order,
  onUpdateStatus,
}: {
  order: AppOrder;
  onUpdateStatus: (orderId: number, status: OrderStatus) => void;
}) {
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const primaryAction = getPrimaryOrderAction(order);
  const hasActualRental = Boolean(order.rentalStartAt && order.rentalEndAt);

  return (
    <AppCard className="flex flex-col gap-4">
      <div className="flex items-start gap-4">
        <div
          className={`flex size-14 shrink-0 items-center justify-center rounded-2xl ${order.bg} ${order.color}`}
        >
          <order.icon size={24} />
        </div>

        <div className="min-w-0 flex-1">
          <h4 className="text-lg font-black leading-snug text-slate-950">
            #{order.id} · {order.title}
          </h4>
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
              <span>
                {hasActualRental
                  ? `Вернуть до: ${formatDateTime(order.rentalEndAt)}`
                  : `Доставка: ${formatDeliveryWindow(order.date, order.time)}`}
                <span className="mt-1 block text-slate-400">
                  {hasActualRental
                    ? `Передано клиенту: ${formatDateTime(order.rentalStartAt)}`
                    : `Срок аренды: ${getTariffLabel(order.tariff)}`}
                </span>
              </span>
            </p>
          </div>
        </div>
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
        </div>
      )}
    </AppCard>
  );
}
