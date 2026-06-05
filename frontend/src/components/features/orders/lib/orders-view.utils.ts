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
    const firstTime = new Date(first.rentalStartAt).getTime();
    const secondTime = new Date(second.rentalStartAt).getTime();
    return firstTime - secondTime;
  });
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
    (order) => new Date(order.rentalStartAt).getTime() >= now,
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
