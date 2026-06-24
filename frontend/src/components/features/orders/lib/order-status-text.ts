import type { AppOrder, OrderStatus } from "@/types";

export function getDeliveryHint(status: OrderStatus) {
  switch (status) {
    case "pending":
      return "Подтвердим детали доставки";
    case "confirmed":
      return "Доставим в выбранный интервал";
    case "delivery":
      return "Курьер уже в пути";
    case "active":
      return "Вещь передана по этому адресу";
    case "returned":
      return "Доставка и возврат завершены";
    case "cancelled":
      return "Бронь отменена";
  }
}

export function getCourierPaymentHint(status: OrderStatus) {
  if (status === "returned") {
    return "Оплата закрывается при получении или по договорённости с курьером";
  }

  if (status === "cancelled") {
    return "Деньги не списывались";
  }

  return "В приложении деньги сейчас не списываются";
}

export function getStatusInfoTitle(status: OrderStatus) {
  switch (status) {
    case "pending":
      return "Проверим наличие";
    case "confirmed":
      return "Бронь подтверждена";
    case "delivery":
      return "Курьер готовит передачу";
    case "active":
      return "Пользуйтесь вещью";
    case "returned":
      return "Аренда завершена";
    case "cancelled":
      return "Бронь отменена";
  }
}

export function getStatusInfoText(order: AppOrder) {
  switch (order.status) {
    case "pending":
      return "Мы свяжемся с вами в ближайшее время и подтвердим детали аренды.";
    case "confirmed":
      return "Мы подготовим вещь и передадим её курьеру в выбранный интервал.";
    case "delivery":
      return "Отслеживания доставки пока нет, но вся информация по брони здесь.";
    case "active":
      return "Не забудьте вернуть вещь к окончанию выбранного периода аренды.";
    case "returned":
      return "Спасибо за аренду. Можно повторить бронь или оставить оценку.";
    case "cancelled":
      return "Эта бронь отменена. Можно выбрать вещь и забронировать снова.";
  }
}
