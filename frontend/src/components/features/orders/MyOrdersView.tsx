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
import {
  getFeaturedOrder,
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
}

export function MyOrdersView({
  orders,
  isLoading,
  error,
  onRefresh,
  onOpenCatalog,
  onLeaveReview,
}: MyOrdersViewProps) {
  const [activeTab, setActiveTab] = useState<OrdersTab>("active");
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);
  const sortedOrders = useMemo(() => sortOrders(orders), [orders]);
  const activeOrders = useMemo(
    () => getVisibleOrdersByTab(sortedOrders, "active"),
    [sortedOrders],
  );
  const historyOrders = useMemo(
    () => getVisibleOrdersByTab(sortedOrders, "completed"),
    [sortedOrders],
  );
  const visibleOrders = useMemo(
    () => (activeTab === "active" ? activeOrders : historyOrders),
    [activeOrders, activeTab, historyOrders],
  );
  const selectedOrder = sortedOrders.find(
    (order) => order.id === selectedOrderId,
  );
  const featuredOrder =
    activeTab === "active" ? getFeaturedOrder(activeOrders) : null;
  const restOrders = featuredOrder
    ? visibleOrders.filter((order) => order.id !== featuredOrder.id)
    : visibleOrders;

  const handleTabChange = (tab: OrdersTab) => {
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleOpenOrder = (orderId: number) => {
    setSelectedOrderId(orderId);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (selectedOrder) {
    return (
      <OrderDetailsView
        order={selectedOrder}
        onBack={() => setSelectedOrderId(null)}
        onLeaveReview={onLeaveReview}
      />
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 px-5 pt-11 pb-[calc(8rem+env(safe-area-inset-bottom))]">
      <div className="mx-auto flex max-w-2xl flex-col gap-6">
        <OrdersHeader onRefresh={onRefresh} />

        {orders.length > 0 && (
          <OrdersTabs
            activeTab={activeTab}
            activeCount={activeOrders.length}
            historyCount={historyOrders.length}
            onTabChange={handleTabChange}
          />
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

        {!isLoading && !error && featuredOrder && (
          <section className="flex flex-col gap-3">
            <AppSectionHeader title="Ближайшее по аренде" />
            <FeaturedOrderCard
              order={featuredOrder}
              onOpen={() => handleOpenOrder(featuredOrder.id)}
            />
          </section>
        )}

        {!isLoading && !error && restOrders.length > 0 && (
          <section className="flex flex-col gap-3">
            <AppSectionHeader
              title={getOrdersSectionTitle(activeTab, restOrders.length)}
              meta={<AppBadge>{restOrders.length}</AppBadge>}
            />
            <div className="flex flex-col gap-3">
              {restOrders.map((order) => (
                <CompactOrderCard
                  key={order.id}
                  order={order}
                  onOpen={() => handleOpenOrder(order.id)}
                />
              ))}
            </div>
          </section>
        )}

        {!isLoading &&
          !error &&
          orders.length > 0 &&
          visibleOrders.length === 0 && (
            <AppNotice>
              {activeTab === "active"
                ? "Активных броней сейчас нет."
                : "История броней пока пуста."}
            </AppNotice>
          )}
      </div>
    </main>
  );
}

function getOrdersSectionTitle(tab: OrdersTab, count: number) {
  if (tab === "completed") {
    return "История броней";
  }

  const lastTwoDigits = count % 100;
  const lastDigit = count % 10;

  if (lastTwoDigits >= 11 && lastTwoDigits <= 14) {
    return `Ещё ${count} броней`;
  }

  if (lastDigit === 1) {
    return "Ещё одна бронь";
  }

  if (lastDigit >= 2 && lastDigit <= 4) {
    return `Ещё ${count} брони`;
  }

  return `Ещё ${count} броней`;
}
