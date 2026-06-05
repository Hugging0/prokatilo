"use client";

import { useState } from "react";
import { RefreshCw } from "lucide-react";

import { CatalogManagement } from "@/components/features/operator/CatalogManagement";
import { PromoCodesManagement } from "@/components/features/operator/PromoCodesManagement";
import { AppEmptyState } from "@/components/ui/AppEmptyState";
import { AppNotice } from "@/components/ui/AppNotice";
import { UI_COPY } from "@/lib/copy";
import type { AppItem } from "@/types";

import { OperatorHeader } from "./components/OperatorHeader";
import { OperatorOrderCard } from "./components/OperatorOrderCard";
import { OperatorQueueStats } from "./components/OperatorQueueStats";
import { OperatorQueueTabs } from "./components/OperatorQueueTabs";
import { OperatorSettingsPanel } from "./components/OperatorSettingsPanel";
import { OperatorTabs } from "./components/OperatorTabs";
import { useAdminOrders } from "./hooks/use-admin-orders";
import {
  filterOrdersByQueue,
  getQueueCounts,
  type OperatorTab,
  type OrderQueue,
} from "./lib/operator-queues";

interface OperatorDashboardProps {
  authToken: string;
  items: AppItem[];
  onCatalogChanged: () => Promise<void>;
}

export function OperatorDashboard({
  authToken,
  items,
  onCatalogChanged,
}: OperatorDashboardProps) {
  const [activeTab, setActiveTab] = useState<OperatorTab>("orders");
  const [activeQueue, setActiveQueue] = useState<OrderQueue>("attention");
  const adminOrders = useAdminOrders({
    authToken,
    items,
    onCatalogChanged,
  });
  const queueCounts = getQueueCounts(adminOrders.orders);
  const filteredOrders = filterOrdersByQueue(adminOrders.orders, activeQueue);

  return (
    <main className="min-h-screen bg-slate-50 px-5 pt-10 pb-32">
      <div className="mx-auto flex max-w-2xl flex-col gap-5">
        <OperatorHeader />
        <OperatorTabs activeTab={activeTab} onTabChange={setActiveTab} />

        {activeTab === "orders" && (
          <section className="flex flex-col gap-5">
            <OperatorQueueStats counts={queueCounts} />

            <div className="flex items-center justify-between gap-3">
            <h3 className="text-lg font-black tracking-tight text-slate-950">
              {UI_COPY.operator.title}
            </h3>
            <button
              type="button"
              onClick={() => void adminOrders.refreshOrders()}
              className="inline-flex min-h-10 items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 text-xs font-black text-slate-500 shadow-sm"
            >
              <RefreshCw size={14} />
              Обновить
            </button>
            </div>

            <OperatorQueueTabs
              activeQueue={activeQueue}
              counts={queueCounts}
              onQueueChange={setActiveQueue}
            />

            {adminOrders.isOrdersLoading && (
              <AppNotice>{UI_COPY.operator.ordersLoading}</AppNotice>
            )}

            {adminOrders.ordersMessage && (
              <AppNotice>{adminOrders.ordersMessage}</AppNotice>
            )}

            <div className="flex flex-col gap-4">
              {filteredOrders.map((order) => (
                <OperatorOrderCard
                  key={order.id}
                  order={order}
                  onUpdateStatus={(orderId, status) =>
                    void adminOrders.updateOrderStatus(orderId, status)
                  }
                />
              ))}

              {!adminOrders.isOrdersLoading && filteredOrders.length === 0 && (
                <AppEmptyState
                  title={UI_COPY.operator.empty}
                  description="В выбранной очереди нет заявок. Попробуйте другую вкладку или обновите список."
                />
              )}
            </div>
          </section>
        )}

        {activeTab === "catalog" && (
          <CatalogManagement
            token={authToken}
            onCatalogChanged={onCatalogChanged}
          />
        )}

        {activeTab === "promo-codes" && (
          <PromoCodesManagement authToken={authToken} />
        )}

        {activeTab === "settings" && <OperatorSettingsPanel />}
      </div>
    </main>
  );
}
