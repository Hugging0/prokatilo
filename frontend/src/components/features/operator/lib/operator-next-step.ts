import type { AppOrder } from "@/types";

export function getOperatorNextStep(order: AppOrder) {
  if (order.status === "pending") {
    return "подтвердить или отменить заявку";
  }

  if (
    order.status === "confirmed" &&
    order.paymentMethod !== "cash" &&
    order.paymentStatus === "pending"
  ) {
    return "дождаться оплаты или связаться с клиентом";
  }

  switch (order.status) {
    case "confirmed":
      return "передать в доставку или отметить выдачу";
    case "delivery":
      return "отметить, что вещь у клиента";
    case "active":
      return "принять возврат и закрыть аренду";
    case "returned":
      return "заявка закрыта";
    case "cancelled":
      return "заявка отменена";
  }
}
