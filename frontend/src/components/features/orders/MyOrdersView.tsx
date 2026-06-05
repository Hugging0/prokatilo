import { useMemo, useState } from "react";

import { AppBadge } from "@/components/ui/AppBadge";
import { AppNotice } from "@/components/ui/AppNotice";
import { AppSectionHeader } from "@/components/ui/AppSectionHeader";
import { UI_COPY } from "@/lib/copy";
import type { AppOrder } from "@/types";

import { CompactOrderCard } from "./components/CompactOrderCard";
import { EmptyOrdersState } from "./components/EmptyOrdersState";
import { FeaturedOrderCard } from "./components/FeaturedOrderCard";
import { OrderDetailsView } from "./components/OrderDetailsView";
import { OrdersHeader } from "./components/OrdersHeader";
import { OrdersTabs } from "./components/OrdersTabs";
import { StatusBadge } from "./components/StatusBadge";
import {
  getNextOrder,
  getVisibleOrdersByTab,
  sortOrders,
} from "./lib/orders-view.utils";
import type { OrdersTab } from "./types";

interface MyOrdersViewProps {
  orders: AppOrder[];
  isLoading: boolean;
  error: string | null;
  onRefresh: () => void;
  onOpenCatalog: () => void;
  onLeaveReview: (
    orderId: number,
    rating: number,
    comment: string,
  ) => void;
  onUpdateAddress: (orderId: number, address: string) => Promise<void>;
  onCancelOrder: (orderId: number) => Promise<void>;
}

export function MyOrdersView({
  orders,
  isLoading,
  error,
  onRefresh,
  onOpenCatalog,
  onLeaveReview,
  onUpdateAddress,
  onCancelOrder,
}: MyOrdersViewProps) {
  const [activeTab, setActiveTab] = useState<OrdersTab>("active");
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);
  const sortedOrders = useMemo(() => sortOrders(orders), [orders]);
  const activeOrders = useMemo(
    () => getVisibleOrdersByTab(sortedOrders, "active"),
    [sortedOrders],
  );
  const visibleOrders = useMemo(
    () => getVisibleOrdersByTab(sortedOrders, activeTab),
    [activeTab, sortedOrders],
  );
  const selectedOrder = sortedOrders.find((order) => order.id === selectedOrderId);
  const nextOrder = getNextOrder(activeOrders);
  const restOrders = visibleOrders.filter((order) => order.id !== nextOrder?.id);

  if (selectedOrder) {
    return (
      <OrderDetailsView
        order={selectedOrder}
        onBack={() => setSelectedOrderId(null)}
        onLeaveReview={onLeaveReview}
        onUpdateAddress={onUpdateAddress}
        onCancelOrder={onCancelOrder}
      />
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 px-5 pt-11 pb-32">
      <div className="mx-auto flex max-w-2xl flex-col gap-6">
        <OrdersHeader onRefresh={onRefresh} />

        {orders.length > 0 && (
          <OrdersTabs activeTab={activeTab} onTabChange={setActiveTab} />
        )}

        {isLoading && <AppNotice>{UI_COPY.orders.loading}</AppNotice>}

        {error && (
          <AppNotice tone="danger">
            <span>{error}</span>
            <button
              type="button"
              onClick={onRefresh}
              className="mt-3 text-sm font-black text-rose-700"
            >
              Обновить
            </button>
          </AppNotice>
        )}

        {!isLoading && !error && orders.length === 0 && (
          <EmptyOrdersState onOpenCatalog={onOpenCatalog} />
        )}

        {orders.length > 0 && activeTab === "active" && nextOrder && (
          <section className="flex flex-col gap-3">
            <AppSectionHeader
              title="Следующая бронь"
              meta={<StatusBadge status={nextOrder.status} />}
            />
            <FeaturedOrderCard
              order={nextOrder}
              onOpen={() => setSelectedOrderId(nextOrder.id)}
            />
          </section>
        )}

        {orders.length > 0 && (
          <section className="flex flex-col gap-3">
            <AppSectionHeader
              title={activeTab === "active" ? "Остальные брони" : "Брони"}
              meta={<AppBadge>{visibleOrders.length}</AppBadge>}
            />
            {restOrders.length > 0 ? (
              <div className="flex flex-col gap-3">
                {restOrders.map((order) => (
                  <CompactOrderCard
                    key={order.id}
                    order={order}
                    onOpen={() => setSelectedOrderId(order.id)}
                  />
                ))}
              </div>
            ) : (
              <AppNotice>
                {activeTab === "active"
                  ? "Других активных броней пока нет."
                  : "В этой вкладке пока нет броней."}
              </AppNotice>
            )}
          </section>
        )}
      </div>
    </main>
  );
}
