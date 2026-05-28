"use client";

import type { FormEvent } from "react";
import { useEffect, useState } from "react";
import { LayoutDashboard } from "lucide-react";

import { CatalogManagement } from "@/components/features/operator/CatalogManagement";
import { clearAdminToken, getAdminToken, setAdminToken } from "@/lib/admin-token";
import { getAdminOrders, updateAdminOrderStatus } from "@/lib/api/admin-orders";
import { UI_COPY } from "@/lib/copy";
import { mapBackendOrdersToAppOrders } from "@/lib/mappers/orders";
import {
  ORDER_STATUSES,
  getAllowedNextOrderStatuses,
} from "@/lib/order-statuses";
import type { AppItem, AppOrder, OrderStatus } from "@/types";

interface OperatorDashboardProps {
  items: AppItem[];
  onCatalogChanged: () => Promise<void>;
}

type OperatorTab = "orders" | "catalog" | "settings";

export function OperatorDashboard({
  items,
  onCatalogChanged,
}: OperatorDashboardProps) {
  const [activeTab, setActiveTab] = useState<OperatorTab>("orders");
  const [token, setToken] = useState<string | null>(() => getAdminToken());
  const [tokenInput, setTokenInput] = useState(() => getAdminToken() ?? "");
  const [orders, setOrders] = useState<AppOrder[]>([]);
  const [isOrdersLoading, setIsOrdersLoading] = useState(() =>
    Boolean(getAdminToken()),
  );
  const [ordersMessage, setOrdersMessage] = useState<string | null>(null);

  async function refreshOrders(activeToken = token) {
    if (!activeToken) {
      return;
    }

    setIsOrdersLoading(true);
    setOrdersMessage(null);

    try {
      const backendOrders = await getAdminOrders(activeToken);
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
    if (!token) {
      return;
    }

    let isMounted = true;

    void getAdminOrders(token)
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
  }, [token, items]);

  const handleSaveToken = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const nextToken = tokenInput.trim();

    if (!nextToken) {
      setOrdersMessage("Введите ключ доступа");
      return;
    }

    setAdminToken(nextToken);
    setToken(nextToken);
    setIsOrdersLoading(true);
    setOrdersMessage(null);
    void refreshOrders(nextToken);
  };

  const handleClearToken = () => {
    clearAdminToken();
    setToken(null);
    setTokenInput("");
    setOrders([]);
    setOrdersMessage(null);
  };

  const handleUpdateOrderStatus = async (
    orderId: number,
    newStatus: OrderStatus,
  ) => {
    if (!token) {
      return;
    }

    try {
      await updateAdminOrderStatus(token, orderId, newStatus);
      await refreshOrders(token);
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

      {!token && (
        <section className="rounded-[2rem] bg-white p-5 text-slate-900 mb-4">
          <h3 className="text-xl font-black">
            {UI_COPY.operator.accessTitle}
          </h3>
          <p className="mt-2 text-sm font-bold text-slate-400">
            {UI_COPY.operator.accessHint}
          </p>

          <form onSubmit={handleSaveToken} className="mt-5 space-y-3">
            <label className="block text-xs font-black uppercase tracking-widest text-slate-400">
              {UI_COPY.operator.accessKeyLabel}
            </label>
            <input
              type="password"
              value={tokenInput}
              onChange={(event) => setTokenInput(event.target.value)}
              className="w-full rounded-2xl border-2 border-slate-100 bg-slate-50 px-4 py-4 text-sm font-bold outline-none focus:border-rose-500"
            />
            <button
              type="submit"
              className="w-full rounded-2xl bg-slate-900 py-4 text-sm font-black text-white"
            >
              {UI_COPY.operator.saveAccessKey}
            </button>
          </form>
        </section>
      )}

      {token && (
        <div className="mb-4 flex justify-end">
          <button
            type="button"
            onClick={handleClearToken}
            className="rounded-2xl bg-white/10 px-4 py-3 text-[10px] font-black text-white/60"
          >
            {UI_COPY.operator.clearAccessKey}
          </button>
        </div>
      )}

      {activeTab === "orders" && token && (
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

      {activeTab === "catalog" && token && (
        <CatalogManagement
          token={token}
          onCatalogChanged={onCatalogChanged}
        />
      )}

      {activeTab !== "settings" && !token && !ordersMessage && (
        <div className="rounded-[2rem] bg-white/5 p-8 text-center text-sm font-bold text-white/40">
          Сохраните ключ доступа, чтобы управлять заявками и каталогом.
        </div>
      )}

      {activeTab === "settings" && (
        <div className="rounded-[2rem] bg-white/5 p-8 text-center text-sm font-bold text-white/40">
          Настройки оператора появятся позже
        </div>
      )}
    </main>
  );
}
