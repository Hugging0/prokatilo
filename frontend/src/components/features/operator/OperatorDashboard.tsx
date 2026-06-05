"use client";

import { useState } from "react";
import { RefreshCw } from "lucide-react";

import { CatalogManagement } from "@/components/features/operator/CatalogManagement";
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
    <main className="min-h-screen bg-slate-950 px-6 pt-12 pb-32 text-white">
      <OperatorHeader />
      <OperatorTabs activeTab={activeTab} onTabChange={setActiveTab} />

      {activeTab === "orders" && (
        <>
          <OperatorQueueStats counts={queueCounts} />

          <div className="mb-4 flex items-center justify-between gap-3">
            <h3 className="font-black">{UI_COPY.operator.title}</h3>
            <button
              type="button"
              onClick={() => void adminOrders.refreshOrders()}
              className="inline-flex items-center gap-2 rounded-2xl bg-white/10 px-3 py-2 text-xs font-black text-white/60"
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
            <AppNotice tone="dark" className="mb-4">
              {UI_COPY.operator.ordersLoading}
            </AppNotice>
          )}

          {adminOrders.ordersMessage && (
            <AppNotice tone="dark" className="mb-4">
              {adminOrders.ordersMessage}
            </AppNotice>
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

      {activeTab === "settings" && <OperatorSettingsPanel />}
    </main>
  );
}
