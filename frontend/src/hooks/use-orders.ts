import { useCallback, useEffect, useState } from "react";

import {
  cancelMyOrder,
  getMyOrders,
  updateMyOrderAddress,
} from "@/lib/api/orders";
import { UI_COPY } from "@/lib/copy";
import {
  mapBackendOrderToAppOrder,
  mapBackendOrdersToAppOrders,
} from "@/lib/mappers/orders";
import type { AppItem, AppOrder, BackendOrderDto } from "@/types";

export function useOrders({
  authToken,
  items,
  onNotify,
}: {
  authToken: string | null;
  items: AppItem[];
  onNotify: (message: string) => void;
}) {
  const [orders, setOrders] = useState<AppOrder[]>([]);
  const [isOrdersLoading, setIsOrdersLoading] = useState(false);
  const [ordersError, setOrdersError] = useState<string | null>(null);

  const reloadOrders = useCallback(
    async (token = authToken) => {
      if (!token) {
        setOrders([]);
        setOrdersError(null);
        return;
      }

      setIsOrdersLoading(true);
      setOrdersError(null);

      try {
        const backendOrders = await getMyOrders(token);
        setOrders((currentOrders) =>
          mapBackendOrdersToAppOrders(backendOrders, items, currentOrders),
        );
      } catch (error) {
        setOrdersError(
          error instanceof Error
            ? error.message
            : UI_COPY.orders.loadError,
        );
      } finally {
        setIsOrdersLoading(false);
      }
    },
    [authToken, items],
  );

  useEffect(() => {
    void Promise.resolve().then(() => reloadOrders());
  }, [reloadOrders]);

  const leaveReview = (
    orderId: number,
    rating: number,
    comment: string,
  ) => {
    setOrders((currentOrders) =>
      currentOrders.map((order) =>
        order.id === orderId
          ? {
              ...order,
              review: {
                rating,
                comment,
              },
            }
          : order,
      ),
    );

    onNotify(UI_COPY.toast.reviewThanks);
  };

  const mergeOrder = (backendOrder: BackendOrderDto) => {
    setOrders((currentOrders) => {
      const existingOrder = currentOrders.find(
        (order) => order.id === backendOrder.id,
      );
      const mappedOrder = mapBackendOrderToAppOrder(
        backendOrder,
        items.find((item) => item.id === backendOrder.item_id),
        existingOrder?.review ?? null,
      );

      return currentOrders.map((order) =>
        order.id === mappedOrder.id ? mappedOrder : order,
      );
    });
  };

  const updateOrderAddress = async (orderId: number, address: string) => {
    if (!authToken) {
      throw new Error(UI_COPY.toast.loginRequired);
    }

    const backendOrder = await updateMyOrderAddress(authToken, orderId, address);
    mergeOrder(backendOrder);
    onNotify(UI_COPY.toast.addressUpdated);
  };

  const cancelOrder = async (orderId: number) => {
    if (!authToken) {
      throw new Error(UI_COPY.toast.loginRequired);
    }

    const backendOrder = await cancelMyOrder(authToken, orderId);
    mergeOrder(backendOrder);
    onNotify(UI_COPY.toast.orderCancelled);
  };

  const clearOrders = () => {
    setOrders([]);
    setOrdersError(null);
  };

  return {
    orders,
    isOrdersLoading,
    ordersError,
    reloadOrders,
    leaveReview,
    updateOrderAddress,
    cancelOrder,
    clearOrders,
  };
}
