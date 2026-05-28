"use client";

import { useEffect, useState } from "react";
import { LayoutDashboard } from "lucide-react";

import { CatalogManagement } from "@/components/features/operator/CatalogManagement";
import { getAdminOrders, updateAdminOrderStatus } from "@/lib/api/admin-orders";
import { UI_COPY } from "@/lib/copy";
import { mapBackendOrdersToAppOrders } from "@/lib/mappers/orders";
import {
  ORDER_STATUSES,
  getAllowedNextOrderStatuses,
} from "@/lib/order-statuses";
import type { AppItem, AppOrder, OrderStatus } from "@/types";

interface OperatorDashboardProps {
  authToken: string;
  items: AppItem[];
  onCatalogChanged: () => Promise<void>;
}

type OperatorTab = "orders" | "catalog" | "settings";

export function OperatorDashboard({
  authToken,
  items,
  onCatalogChanged,
}: OperatorDashboardProps) {
  const [activeTab, setActiveTab] = useState<OperatorTab>("orders");
  const [orders, setOrders] = useState<AppOrder[]>([]);
  const [isOrdersLoading, setIsOrdersLoading] = useState(true);
  const [ordersMessage, setOrdersMessage] = useState<string | null>(null);

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
            className={`rounded-2xl px-4 py-3 text-[10px] font-black ${
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
          <h3 className="font-black mb-4">{UI_COPY.operator.title}</h3>

          {isOrdersLoading && (
            <div className="mb-4 rounded-[2rem] bg-white/5 p-4 text-sm font-bold text-white/60">
              {UI_COPY.operator.ordersLoading}
            </div>
          )}

          {ordersMessage && (
            <div className="mb-4 rounded-[2rem] bg-white/10 p-4 text-xs font-black text-white/70">
              {ordersMessage}
            </div>
          )}

          <div className="space-y-4">
            {orders.map((order) => (
              <article
                key={order.id}
                className="bg-white text-slate-900 rounded-[2rem] p-5"
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`w-14 h-14 rounded-2xl ${order.bg} ${order.color} flex items-center justify-center`}
                  >
                    <order.icon size={24} />
                  </div>

                  <div className="min-w-0">
                    <h4 className="font-black">{order.title}</h4>
                    <p className="text-xs font-bold text-slate-400">
                      {UI_COPY.operator.clientLabel}: {order.customerName}
                    </p>
                    <p className="text-xs font-bold text-slate-400">
                      {order.customerPhone} • {order.deliveryAddress}
                    </p>
                    <p className="text-xs font-bold text-slate-400">
                      {order.price}₽ • {order.date} • {order.time}
                    </p>
                  </div>
                </div>

                <p className="mt-3 text-sm font-bold text-slate-500">
                  {ORDER_STATUSES[order.status].description}
                </p>

                <div className="mt-5 flex flex-wrap gap-2">
                  <span className="rounded-xl bg-slate-900 px-3 py-2 text-[9px] font-black uppercase text-white shadow-md">
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
                        className="rounded-xl bg-slate-100 px-3 py-2 text-[9px] font-black uppercase text-slate-500 transition-all hover:bg-slate-200"
                      >
                        {ORDER_STATUSES[status].operatorLabel}
                      </button>
                    ),
                  )}
                </div>
              </article>
            ))}

            {!isOrdersLoading && orders.length === 0 && (
              <div className="bg-white/5 rounded-[2rem] p-8 text-center text-white/40 font-bold">
                {UI_COPY.operator.empty}
              </div>
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
        <div className="rounded-[2rem] bg-white/5 p-8 text-center text-sm font-bold text-white/40">
          Настройки оператора появятся позже
        </div>
      )}
    </main>
  );
}
