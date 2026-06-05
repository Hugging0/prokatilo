import type { AppOrder, OrderStatus } from "@/types";

export interface OperatorOrderAction {
  label: string;
  nextStatus: OrderStatus;
}

export function getPrimaryOrderAction(
  order: AppOrder,
): OperatorOrderAction | null {
  switch (order.status) {
    case "pending":
      return { label: "Подтвердить", nextStatus: "confirmed" };
    case "confirmed":
      return { label: "Курьер выехал", nextStatus: "delivery" };
    case "delivery":
      return { label: "Передано клиенту", nextStatus: "active" };
    case "active":
      return { label: "Принять возврат", nextStatus: "returned" };
    case "returned":
    case "cancelled":
      return null;
  }
}

export function canCancelOrder(order: AppOrder): boolean {
  return ["pending", "confirmed", "delivery"].includes(order.status);
}
