import { getDateTimeFromInputs } from "@/lib/booking-time";
import { getTariffLabel } from "@/lib/tariffs";
import type { AppOrder, OrderStatus } from "@/types";

import type { OrdersTab } from "../types";

const ACTIVE_STATUSES: OrderStatus[] = [
  "pending",
  "confirmed",
  "delivery",
  "active",
];

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

  return orders;
}

export function getNextOrder(activeOrders: AppOrder[]) {
  const now = Date.now();
  const futureOrder = activeOrders.find(
    (order) => getOrderSortTime(order) >= now,
  );

  return (
    futureOrder ??
    activeOrders.find((order) => order.status === "active") ??
    activeOrders[0] ??
    null
  );
}

export function formatPricePerDay(order: AppOrder) {
  return `${order.price} ₽ · ${getTariffLabel(order.tariff)}`;
}
