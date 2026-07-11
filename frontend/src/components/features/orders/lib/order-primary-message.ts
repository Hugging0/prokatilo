import { formatDateTime, formatDeliveryWindow } from "@/lib/booking-time";
import type { AppOrder } from "@/types";

interface OrderPrimaryMessage {
  title: string;
  description: string;
}

export function getOrderPrimaryMessage(
  order: AppOrder,
): OrderPrimaryMessage {
  switch (order.status) {
    case "pending":
      return {
        title: "Оператор скоро свяжется",
        description: `Подтвердим бронь и доставку: ${formatDeliveryWindow(
          order.date,
          order.time,
        )}.`,
      };

    case "confirmed":
      return {
        title: `Привезём ${formatDeliveryWindow(order.date, order.time)}`,
        description:
          "Вещь закреплена за вами. Курьер позвонит перед приездом.",
      };

    case "delivery":
      return {
        title: `Ожидайте ${formatDeliveryWindow(order.date, order.time)}`,
        description:
          "Держите телефон рядом: курьер позвонит перед приездом.",
      };

    case "active":
      return {
        title: order.rentalEndAt
          ? `Вернуть до ${formatDateTime(order.rentalEndAt)}`
          : "Аренда уже началась",
        description:
          "Если хотите продлить аренду, свяжитесь с поддержкой заранее.",
      };

    case "returned":
      return {
        title: "Аренда завершена",
        description: "Спасибо! Можно оставить оценку или выбрать новую вещь.",
      };

    case "cancelled":
      return {
        title: "Бронь отменена",
        description: "Оплата не требуется. Можно выбрать другую вещь.",
      };
  }
}

export function getOrderPaymentSummary(order: AppOrder) {
  if (order.status === "cancelled") {
    return {
      label: "Оплата",
      value: "Не требуется",
    };
  }

  if (order.status === "returned") {
    return {
      label: "Итого по аренде",
      value: `${order.price} ₽`,
    };
  }

  if (order.status === "active") {
    return {
      label: "Стоимость аренды",
      value: `${order.price} ₽`,
    };
  }

  return {
    label: "К оплате",
    value: `${order.price} ₽ при получении`,
  };
}
