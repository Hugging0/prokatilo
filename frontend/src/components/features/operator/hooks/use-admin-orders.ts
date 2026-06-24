import { useCallback, useEffect, useState } from "react";

import { getAdminOrders, updateAdminOrderStatus } from "@/lib/api/admin-orders";
import { useAutoRefresh } from "@/hooks/use-auto-refresh";
import { UI_COPY } from "@/lib/copy";
import { mapBackendOrdersToAppOrders } from "@/lib/mappers/orders";
import type { AppItem, AppOrder, OrderStatus } from "@/types";

export function useAdminOrders({
  authToken,
  items,
  isAutoRefreshEnabled = true,
  onCatalogChanged,
}: {
  authToken: string;
  items: AppItem[];
  isAutoRefreshEnabled?: boolean;
  onCatalogChanged: () => Promise<void>;
}) {
  const [orders, setOrders] = useState<AppOrder[]>([]);
  const [isOrdersLoading, setIsOrdersLoading] = useState(true);
  const [ordersMessage, setOrdersMessage] = useState<string | null>(null);

  const refreshOrders = useCallback(async (
    { showLoading = true }: { showLoading?: boolean } = {},
  ) => {
    if (showLoading) {
      setIsOrdersLoading(true);
    }

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
      if (showLoading) {
        setIsOrdersLoading(false);
      }
    }
  }, [authToken, items]);

  useEffect(() => {
    void Promise.resolve().then(() => refreshOrders());
  }, [refreshOrders]);

  useAutoRefresh({
    enabled: isAutoRefreshEnabled,
    intervalMs: 20_000,
    onRefresh: () => refreshOrders({ showLoading: false }),
    refreshOnEnable: true,
  });

  const updateOrderStatus = async (
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

  return {
    orders,
    isOrdersLoading,
    ordersMessage,
    refreshOrders,
    updateOrderStatus,
  };
}
