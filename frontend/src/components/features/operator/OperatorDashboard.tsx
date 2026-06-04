"use client";

import { useEffect, useState } from "react";
import {
  CalendarClock,
  Clock3,
  CreditCard,
  LayoutDashboard,
  MapPin,
  Phone,
  RefreshCw,
  Settings,
} from "lucide-react";

import { CatalogManagement } from "@/components/features/operator/CatalogManagement";
import { AppBadge } from "@/components/ui/AppBadge";
import { AppCard } from "@/components/ui/AppCard";
import { AppEmptyState } from "@/components/ui/AppEmptyState";
import { AppInfoRow } from "@/components/ui/AppInfoRow";
import { AppNotice } from "@/components/ui/AppNotice";
import { getAdminOrders, updateAdminOrderStatus } from "@/lib/api/admin-orders";
import { formatRentalPeriod, isTodayInAppTimeZone } from "@/lib/booking-time";
import { UI_COPY } from "@/lib/copy";
import { mapBackendOrdersToAppOrders } from "@/lib/mappers/orders";
import {
  ORDER_STATUSES,
  getAllowedNextOrderStatuses,
} from "@/lib/order-statuses";
import {
  PAYMENT_STATUS_CLASSES,
  PAYMENT_STATUS_LABELS,
} from "@/lib/payment-statuses";
import type { AppItem, AppOrder, OrderStatus } from "@/types";

interface OperatorDashboardProps {
  authToken: string;
  items: AppItem[];
  onCatalogChanged: () => Promise<void>;
}

type OperatorTab = "orders" | "catalog" | "settings";
type OrderQueue = "attention" | "today" | "active" | "returns" | "all";

export function OperatorDashboard({
  authToken,
  items,
  onCatalogChanged,
}: OperatorDashboardProps) {
  const [activeTab, setActiveTab] = useState<OperatorTab>("orders");
  const [orders, setOrders] = useState<AppOrder[]>([]);
  const [isOrdersLoading, setIsOrdersLoading] = useState(true);
  const [ordersMessage, setOrdersMessage] = useState<string | null>(null);
  const [activeQueue, setActiveQueue] = useState<OrderQueue>("attention");

  const queueCounts = getQueueCounts(orders);
  const filteredOrders = filterOrdersByQueue(orders, activeQueue);

  async function refreshOrders() {
    setIsOrdersLoading(true);
    setOrdersMessage(null);

    try {
      const backendOrders = await getAdminOrders(authToken);
      setOrders((currentOrders) =>
        mapBackendOrdersToAppOrders(backendOrders, items, currentOrders),
      );
    } catch (error) {
      setOrdersMessage(
        error instanceof Error
          ? error.message
          : UI_COPY.operator.ordersLoadError,
      );
    } finally {
      setIsOrdersLoading(false);
    }
  }

  useEffect(() => {
    let isMounted = true;

    void getAdminOrders(authToken)
      .then((backendOrders) => {
        if (!isMounted) {
          return;
        }

        setOrders((currentOrders) =>
          mapBackendOrdersToAppOrders(backendOrders, items, currentOrders),
        );
      })
      .catch((error) => {
        if (!isMounted) {
          return;
        }

        setOrdersMessage(
          error instanceof Error
            ? error.message
            : UI_COPY.operator.ordersLoadError,
        );
      })
      .finally(() => {
        if (isMounted) {
          setIsOrdersLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [authToken, items]);

  const handleUpdateOrderStatus = async (
    orderId: number,
    newStatus: OrderStatus,
  ) => {
    try {
      await updateAdminOrderStatus(authToken, orderId, newStatus);
      await refreshOrders();
      await onCatalogChanged();
      setOrdersMessage(UI_COPY.toast.statusUpdated);
    } catch (error) {
      setOrdersMessage(
        error instanceof Error
          ? error.message
          : "Не удалось обновить статус заявки",
      );
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 px-6 pt-12 pb-32 text-white">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-3xl font-black tracking-tighter leading-none">
            {UI_COPY.operator.title}
          </h2>
          <p className="text-white/40 text-sm font-bold mt-1">
            {UI_COPY.operator.subtitle}
          </p>
        </div>

        <LayoutDashboard className="text-white/30" size={30} />
      </div>

      <div className="mb-5 flex gap-2 overflow-x-auto pb-1">
        {[
          ["orders", UI_COPY.operator.title],
          ["catalog", UI_COPY.operator.catalogTitle],
          ["settings", UI_COPY.operator.settingsTitle],
        ].map(([tab, label]) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab as OperatorTab)}
            className={`rounded-2xl px-4 py-3 text-xs font-black ${
              activeTab === tab
                ? "bg-white text-slate-900"
                : "bg-white/10 text-white/50"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {activeTab === "orders" && (
        <>
          <section className="mb-5 grid grid-cols-3 gap-3">
            <div className="rounded-[1.5rem] bg-white/10 p-4">
              <p className="text-xs font-black uppercase tracking-widest text-white/40">
                Новые
              </p>
              <p className="mt-1 text-2xl font-black">
                {queueCounts.attention}
              </p>
            </div>
            <div className="rounded-[1.5rem] bg-white/10 p-4">
              <p className="text-xs font-black uppercase tracking-widest text-white/40">
                Сегодня
              </p>
              <p className="mt-1 text-2xl font-black">
                {queueCounts.today}
              </p>
            </div>
            <div className="rounded-[1.5rem] bg-white/10 p-4">
              <p className="text-xs font-black uppercase tracking-widest text-white/40">
                Активные
              </p>
              <p className="mt-1 text-2xl font-black">
                {queueCounts.active}
              </p>
            </div>
          </section>

          <div className="mb-4 flex items-center justify-between gap-3">
            <h3 className="font-black">{UI_COPY.operator.title}</h3>
            <button
              type="button"
              onClick={() => void refreshOrders()}
              className="inline-flex items-center gap-2 rounded-2xl bg-white/10 px-3 py-2 text-xs font-black text-white/60"
            >
              <RefreshCw size={14} />
              Обновить
            </button>
          </div>

          <div className="mb-5 flex gap-2 overflow-x-auto pb-1">
            {[
              {
                queue: "attention" as const,
                label: "Новые",
                count: queueCounts.attention,
              },
              {
                queue: "today" as const,
                label: "Сегодня",
                count: queueCounts.today,
              },
              {
                queue: "active" as const,
                label: "Активные",
                count: queueCounts.active,
              },
              {
                queue: "returns" as const,
                label: "Возвраты",
                count: queueCounts.returns,
              },
              {
                queue: "all" as const,
                label: "Все",
                count: queueCounts.all,
              },
            ].map(({ queue, label, count }) => (
              <button
                key={queue}
                type="button"
                onClick={() => setActiveQueue(queue)}
                className={`rounded-2xl px-4 py-3 text-xs font-black ${
                  activeQueue === queue
                    ? "bg-white text-slate-900"
                    : "bg-white/10 text-white/50"
                }`}
              >
                {label} · {count}
              </button>
            ))}
          </div>

          {isOrdersLoading && (
            <AppNotice tone="dark" className="mb-4">
              {UI_COPY.operator.ordersLoading}
            </AppNotice>
          )}

          {ordersMessage && (
            <AppNotice tone="dark" className="mb-4">
              {ordersMessage}
            </AppNotice>
          )}

          <div className="flex flex-col gap-4">
            {filteredOrders.map((order) => (
              <article
                key={order.id}
                className="rounded-[1.75rem] bg-white p-5 text-slate-900 shadow-sm"
              >
                <div className="flex items-start gap-4">
                  <div
                    className={`w-14 h-14 rounded-2xl ${order.bg} ${order.color} flex items-center justify-center`}
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
                        {formatRentalPeriod(
                          order.rentalStartAt,
                          order.rentalEndAt,
                        )}
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
                  <span className="text-slate-400">Итого:</span>{" "}
                  {order.price}₽ ·{" "}
                  <span className="text-slate-400">следующий шаг:</span>{" "}
                  {getOperatorNextStep(order)}
                </div>

                <div className="mt-5 flex flex-wrap gap-2">
                  <span className="rounded-xl bg-slate-900 px-3 py-2 text-xs font-black uppercase text-white shadow-md">
                    {ORDER_STATUSES[order.status].operatorLabel}
                  </span>

                  {getAllowedNextOrderStatuses(order.status).map(
                    (status) => (
                      <button
                        key={status}
                        type="button"
                        onClick={() =>
                          void handleUpdateOrderStatus(order.id, status)
                        }
                        className="rounded-xl bg-slate-100 px-3 py-2 text-xs font-black uppercase text-slate-500 transition-all hover:bg-slate-200"
                      >
                        {ORDER_STATUSES[status].operatorLabel}
                      </button>
                    ),
                  )}
                </div>
              </article>
            ))}

            {!isOrdersLoading && filteredOrders.length === 0 && (
              <AppEmptyState
                dark
                title={UI_COPY.operator.empty}
                description="В выбранной очереди нет заявок. Попробуйте другую вкладку или обновите список."
              />
            )}
          </div>
        </>
      )}

      {activeTab === "catalog" && (
        <CatalogManagement
          token={authToken}
          onCatalogChanged={onCatalogChanged}
        />
      )}

      {activeTab === "settings" && (
        <AppCard variant="dark" className="flex flex-col gap-5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-black tracking-tight text-white">
                Настройки сервиса
              </h3>
              <p className="mt-1 text-sm font-bold leading-relaxed text-white/50">
                Сейчас это справка по текущему режиму MVP.
              </p>
            </div>
            <AppBadge className="bg-white/10 text-white">Read-only</AppBadge>
          </div>
          <AppInfoRow
            dark
            icon={CreditCard}
            label="Режим оплаты"
            value="Курьеру при получении"
            hint="Онлайн-оплата в клиентском интерфейсе отключена"
          />
          <AppInfoRow
            dark
            icon={Clock3}
            label="Интервалы доставки"
            value="08:00–20:00"
            hint="Выбор идет двухчасовыми окнами"
          />
          <AppInfoRow
            dark
            icon={Settings}
            label="Часовой пояс"
            value="Europe/Moscow"
            hint="Все даты и слоты показываются в московском времени"
          />
          <AppInfoRow
            dark
            icon={Phone}
            label="Поддержка"
            value="Связь с клиентом вручную"
            hint="Трекинг доставки пока не реализован"
          />
        </AppCard>
      )}
    </main>
  );
}

function getQueueCounts(orders: AppOrder[]) {
  return {
    attention: filterOrdersByQueue(orders, "attention").length,
    today: filterOrdersByQueue(orders, "today").length,
    active: filterOrdersByQueue(orders, "active").length,
    returns: filterOrdersByQueue(orders, "returns").length,
    all: orders.length,
  };
}

function filterOrdersByQueue(orders: AppOrder[], queue: OrderQueue) {
  switch (queue) {
    case "attention":
      return orders.filter(
        (order) =>
          order.status === "pending" ||
          (order.status === "confirmed" &&
            order.paymentMethod !== "cash" &&
            order.paymentStatus === "pending"),
      );
    case "today":
      return orders.filter((order) =>
        isTodayInAppTimeZone(order.rentalStartAt),
      );
    case "active":
      return orders.filter((order) =>
        ["confirmed", "delivery", "active"].includes(order.status),
      );
    case "returns":
      return orders.filter((order) => order.status === "active");
    case "all":
      return orders;
  }
}

function getOperatorNextStep(order: AppOrder) {
  if (order.status === "pending") {
    return "подтвердить или отменить заявку";
  }

  if (
    order.status === "confirmed" &&
    order.paymentMethod !== "cash" &&
    order.paymentStatus === "pending"
  ) {
    return "дождаться оплаты или связаться с клиентом";
  }

  switch (order.status) {
    case "confirmed":
      return "передать в доставку или отметить выдачу";
    case "delivery":
      return "отметить, что вещь у клиента";
    case "active":
      return "принять возврат и закрыть аренду";
    case "returned":
      return "заявка закрыта";
    case "cancelled":
      return "заявка отменена";
  }
}
