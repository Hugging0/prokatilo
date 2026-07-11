import { getDateTimeFromInputs } from "@/lib/booking-time";
import type { AppOrder, OrderStatus } from "@/types";

import type { OrdersTab } from "../types";

const ACTIVE_STATUSES: OrderStatus[] = [
  "pending",
  "confirmed",
  "delivery",
  "active",
];

const FEATURED_STATUS_PRIORITY: Partial<Record<OrderStatus, number>> = {
  active: 0,
  delivery: 1,
  confirmed: 2,
  pending: 3,
};

export function sortOrders(orders: AppOrder[]) {
  return [...orders].sort((first, second) => {
    const firstTime = getOrderSortTime(first);
    const secondTime = getOrderSortTime(second);
    return firstTime - secondTime;
  });
}

function getOrderSortTime(order: AppOrder) {
  const date =
    order.rentalStartAt !== null
      ? new Date(order.rentalStartAt)
      : getDateTimeFromInputs(order.date, order.time);

  return date && !Number.isNaN(date.getTime()) ? date.getTime() : 0;
}

export function getVisibleOrdersByTab(orders: AppOrder[], activeTab: OrdersTab) {
  if (activeTab === "active") {
    return orders.filter((order) => ACTIVE_STATUSES.includes(order.status));
  }

  if (activeTab === "completed") {
    return orders.filter((order) =>
      ["returned", "cancelled"].includes(order.status),
    );
  }

  return [];
}

export function getFeaturedOrder(activeOrders: AppOrder[]) {
  return (
    [...activeOrders].sort((first, second) => {
      const firstPriority = FEATURED_STATUS_PRIORITY[first.status] ?? 99;
      const secondPriority = FEATURED_STATUS_PRIORITY[second.status] ?? 99;

      if (firstPriority !== secondPriority) {
        return firstPriority - secondPriority;
      }

      return getOrderSortTime(first) - getOrderSortTime(second);
    })[0] ??
    null
  );
}

export function formatOrderPrice(order: AppOrder) {
  return `${order.price} ₽`;
}
