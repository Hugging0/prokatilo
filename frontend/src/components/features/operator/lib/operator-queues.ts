import { getDateTimeFromInputs, isTodayInAppTimeZone } from "@/lib/booking-time";
import type { AppOrder } from "@/types";

export type OperatorTab = "orders" | "catalog" | "promo-codes" | "settings";
export type OrderQueue = "attention" | "today" | "active" | "all";

export const ORDER_QUEUE_CONFIG: Array<{
  queue: OrderQueue;
  label: string;
}> = [
  { queue: "attention", label: "Новые" },
  { queue: "today", label: "Сегодня" },
  { queue: "active", label: "В работе" },
  { queue: "all", label: "Все" },
];

export function getQueueCounts(orders: AppOrder[]) {
  return {
    attention: filterOrdersByQueue(orders, "attention").length,
    today: filterOrdersByQueue(orders, "today").length,
    active: filterOrdersByQueue(orders, "active").length,
    all: orders.length,
  };
}

export function filterOrdersByQueue(orders: AppOrder[], queue: OrderQueue) {
  switch (queue) {
    case "attention":
      return orders.filter(
        (order) =>
          order.status === "pending" ||
          (order.status === "confirmed" &&
            order.paymentMethod !== "cash" &&
            order.paymentStatus === "pending"),
      );
    case "today":
      return orders.filter((order) =>
        isTodayInAppTimeZone(
          order.rentalStartAt ?? getDateTimeFromInputs(order.date, order.time) ?? "",
        ),
      );
    case "active":
      return orders.filter((order) =>
        ["confirmed", "delivery", "active"].includes(order.status),
      );
    case "all":
      return orders;
  }
}
