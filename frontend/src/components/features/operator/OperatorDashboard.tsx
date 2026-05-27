"use client";

import { useState } from "react";
import { LayoutDashboard } from "lucide-react";

import { UI_COPY } from "@/lib/copy";
import {
  ORDER_STATUS_OPTIONS,
  ORDER_STATUSES,
} from "@/lib/order-statuses";
import type { AppOrder, OrderStatus } from "@/types";
import { CatalogManagement } from "@/components/features/operator/CatalogManagement";

interface OperatorDashboardProps {
  orders: AppOrder[];
  onUpdateOrderStatus: (
    orderId: string,
    newStatus: OrderStatus,
  ) => void;
  onCatalogChanged: () => Promise<void>;
}

type OperatorTab = "orders" | "catalog" | "settings";

export function OperatorDashboard({
  orders,
  onUpdateOrderStatus,
  onCatalogChanged,
}: OperatorDashboardProps) {
  const [activeTab, setActiveTab] = useState<OperatorTab>("orders");

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

                  <div>
                    <h4 className="font-black">{order.title}</h4>
                    <p className="text-xs font-bold text-slate-400">
                      {UI_COPY.operator.clientLabel}: {order.userId} •{" "}
                      {order.price}₽
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mt-5">
                  {ORDER_STATUS_OPTIONS.map((status) => (
                    <button
                      key={status}
                      type="button"
                      onClick={() =>
                        onUpdateOrderStatus(order.id, status)
                      }
                      className={`px-3 py-2 rounded-xl text-[9px] font-black uppercase transition-all ${
                        order.status === status
                          ? "bg-slate-900 text-white shadow-md"
                          : "bg-slate-100 text-slate-400"
                      }`}
                    >
                      {ORDER_STATUSES[status].operatorLabel}
                    </button>
                  ))}
                </div>
              </article>
            ))}

            {orders.length === 0 && (
              <div className="bg-white/5 rounded-[2rem] p-8 text-center text-white/40 font-bold">
                {UI_COPY.operator.empty}
              </div>
            )}
          </div>
        </>
      )}

      {activeTab === "catalog" && (
        <CatalogManagement onCatalogChanged={onCatalogChanged} />
      )}

      {activeTab === "settings" && (
        <div className="rounded-[2rem] bg-white/5 p-8 text-center text-sm font-bold text-white/40">
          Настройки оператора появятся позже
        </div>
      )}
    </main>
  );
}
