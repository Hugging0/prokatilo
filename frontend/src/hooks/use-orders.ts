import { useCallback, useEffect, useState } from "react";

import { getMyOrders } from "@/lib/api/orders";
import { UI_COPY } from "@/lib/copy";
import { mapBackendOrdersToAppOrders } from "@/lib/mappers/orders";
import type { AppItem, AppOrder } from "@/types";

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
    clearOrders,
  };
}
