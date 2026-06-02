import { CreditCard, MessageCircle, RefreshCw, Star } from "lucide-react";

import { formatRentalPeriod } from "@/lib/booking-time";
import {
  getPaymentMethodLabel,
  UI_COPY,
} from "@/lib/copy";
import { ORDER_STATUSES } from "@/lib/order-statuses";
import {
  PAYMENT_STATUS_CLASSES,
  PAYMENT_STATUS_LABELS,
} from "@/lib/payment-statuses";
import { getTariffLabel } from "@/lib/tariffs";
import type { AppOrder } from "@/types";

interface MyOrdersViewProps {
  orders: AppOrder[];
  isLoading: boolean;
  error: string | null;
  onRefresh: () => void;
  onPay: (order: AppOrder) => void;
  onLeaveReview: (
    orderId: number,
    rating: number,
    comment: string,
  ) => void;
}

export function MyOrdersView({
  orders,
  isLoading,
  error,
  onRefresh,
  onPay,
  onLeaveReview,
}: MyOrdersViewProps) {
  const activeOrders = orders.filter(
    (order) => order.status !== "cancelled" && order.status !== "returned",
  );
  const completedOrders = orders.filter(
    (order) => order.status === "returned" || order.status === "cancelled",
  );

  return (
    <main className="min-h-screen bg-slate-50 px-6 pt-12 pb-32">
      <h2 className="text-3xl font-black text-slate-900 tracking-tighter leading-none mb-6">
        {UI_COPY.orders.title}
      </h2>

      {orders.length > 0 && (
        <section className="mb-5 grid grid-cols-2 gap-3">
          <div className="rounded-[2rem] bg-white p-4 shadow-sm border border-slate-100">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
              Активные
            </p>
            <p className="mt-1 text-3xl font-black text-slate-900">
              {activeOrders.length}
            </p>
          </div>
          <div className="rounded-[2rem] bg-white p-4 shadow-sm border border-slate-100">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
              Завершены
            </p>
            <p className="mt-1 text-3xl font-black text-slate-900">
              {completedOrders.length}
            </p>
          </div>
        </section>
      )}

      {isLoading && (
        <div className="mb-4 rounded-[2rem] bg-white p-4 text-sm font-bold text-slate-400">
          {UI_COPY.orders.loading}
        </div>
      )}

      {error && (
        <div className="mb-4 rounded-[2rem] bg-rose-50 p-4 text-sm font-bold text-rose-500">
          {error}
          <button
            type="button"
            onClick={onRefresh}
            className="mt-3 block text-left text-xs font-black uppercase tracking-widest"
          >
            Обновить
          </button>
        </div>
      )}

      <div className="space-y-4">
        {orders.map((order) => {
          const status = ORDER_STATUSES[order.status];
          const canPay =
            order.paymentMethod !== "cash" &&
            order.paymentStatus === "pending" &&
            order.status !== "cancelled";

          return (
            <article
              key={order.id}
              className="bg-white rounded-[2rem] p-5 border border-slate-100 shadow-sm"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div
                    className={`w-14 h-14 rounded-2xl ${order.bg} ${order.color} flex items-center justify-center`}
                  >
                    <order.icon size={24} />
                  </div>

                  <div>
                    <h3 className="font-black text-slate-900 tracking-tight">
                      {order.title}
                    </h3>
                    <p className="text-xs font-bold text-slate-400 mt-1">
                      {formatRentalPeriod(
                        order.rentalStartAt,
                        order.rentalEndAt,
                      )}
                    </p>
                  </div>
                </div>

                <span
                  className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-black ${status.color}`}
                >
                  <status.icon size={10} />
                  {status.clientLabel}
                </span>
              </div>

              <p className="mt-3 text-sm font-bold text-slate-500 leading-relaxed">
                {status.description}
              </p>

              <div className="mt-4 rounded-2xl bg-slate-50 p-4">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                  Что дальше
                </p>
                <p className="mt-2 text-sm font-bold text-slate-600">
                  {getClientNextStep(order)}
                </p>
              </div>

              <div className="mt-4 space-y-2 text-sm font-black text-slate-500">
                <div className="flex items-center justify-between gap-4">
                  <span>
                    {UI_COPY.orders.tariffLabel}:{" "}
                    {getTariffLabel(order.tariff)}
                  </span>
                  <span>
                    {UI_COPY.orders.priceLabel}: {order.price}₽
                  </span>
                </div>
                <p>
                  {UI_COPY.orders.paymentLabel}:{" "}
                  {getPaymentMethodLabel(order.paymentMethod)}
                </p>
                <p className="flex items-center justify-between gap-3">
                  <span>{UI_COPY.orders.paymentStatusLabel}</span>
                  <span
                    className={`rounded-full px-3 py-1 text-[10px] font-black ${PAYMENT_STATUS_CLASSES[order.paymentStatus]}`}
                  >
                    {PAYMENT_STATUS_LABELS[order.paymentStatus]}
                  </span>
                </p>
                <p>
                  {UI_COPY.orders.deliveryLabel}:{" "}
                  {order.deliveryAddress}
                </p>
              </div>

              {order.status === "returned" && !order.review && (
                <div className="mt-5 rounded-2xl bg-amber-50 p-4">
                  <p className="text-xs font-black text-amber-700 mb-3">
                    {UI_COPY.orders.reviewTitle}
                  </p>

                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() =>
                          onLeaveReview(order.id, star, "")
                        }
                        className="text-amber-400 hover:scale-125 transition-transform"
                      >
                        <Star size={22} fill="currentColor" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {order.review && (
                <div className="mt-5 rounded-2xl bg-slate-50 p-4 text-xs font-black text-slate-500">
                  {UI_COPY.orders.reviewThanks}: {order.review.rating} ⭐
                </div>
              )}

              {canPay && (
                <button
                  type="button"
                  onClick={() => onPay(order)}
                  className="mt-5 w-full flex items-center justify-center gap-2 rounded-2xl bg-rose-500 py-4 text-sm font-black text-white shadow-lg shadow-rose-100"
                >
                  <CreditCard size={18} />
                  Оплатить бронь
                </button>
              )}

              <button
                type="button"
                className={`w-full flex items-center justify-center gap-2 bg-slate-900 text-white rounded-2xl py-4 text-sm font-black ${
                  canPay ? "mt-3" : "mt-5"
                }`}
              >
                <MessageCircle size={18} />
                {UI_COPY.orders.supportButton}
              </button>
            </article>
          );
        })}

        {orders.length === 0 && (
          <div className="bg-white rounded-[2rem] p-8 text-center text-slate-400 font-bold">
            <RefreshCw className="mx-auto mb-3 text-slate-300" size={28} />
            {UI_COPY.orders.empty}
          </div>
        )}
      </div>
    </main>
  );
}

function getClientNextStep(order: AppOrder) {
  if (order.status === "cancelled") {
    return "Бронь отменена. Можно выбрать новое время в каталоге.";
  }

  if (order.paymentMethod !== "cash" && order.paymentStatus === "pending") {
    return "Оплатите бронь после подтверждения, чтобы оператор передал её в доставку.";
  }

  switch (order.status) {
    case "pending":
      return "Оператор проверит доступность и подтвердит заявку.";
    case "confirmed":
      return "Бронь подтверждена. Мы готовим вещь и свяжемся по доставке.";
    case "delivery":
      return "Курьер в пути. Держите телефон рядом.";
    case "active":
      return "Вещь у вас. Верните её к окончанию выбранного периода.";
    case "returned":
      return "Аренда завершена. Можно оставить оценку или оформить новую бронь.";
  }
}
