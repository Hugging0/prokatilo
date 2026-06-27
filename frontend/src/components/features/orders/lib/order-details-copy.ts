import {
  BUSINESS_PHONE_HREF,
  BUSINESS_TELEGRAM_URL,
} from "@/lib/business";
import type { OrderStatus } from "@/types";

export const ORDER_DETAILS_COPY = {
  support: {
    title: "Поддержка",
    description: "Напишите нам в Telegram или позвоните — поможем с бронью.",
    telegramUrl: BUSINESS_TELEGRAM_URL,
    phoneHref: BUSINESS_PHONE_HREF,
    telegramButton: "Написать в Telegram",
    phoneButton: "Позвонить",
  },
  statusHero: {
    pending: {
      title: "Бронь на проверке",
      text: "Проверим наличие и подтвердим время.",
    },
    confirmed: {
      title: "Бронь подтверждена",
      text: "Вещь закреплена за вами. Привезём в выбранный интервал.",
    },
    delivery: {
      title: "Курьер в пути",
      text: "Держите телефон рядом — свяжемся перед передачей.",
    },
    active: {
      title: "Вещь у вас",
      text: "Пользуйтесь до конца аренды. Если нужно продлить — напишите нам.",
    },
    returned: {
      title: "Аренда завершена",
      text: "Спасибо! Будем рады видеть вас снова.",
    },
    cancelled: {
      title: "Бронь отменена",
      text: "Можно выбрать другую вещь и забронировать снова.",
    },
  } satisfies Record<OrderStatus, { title: string; text: string }>,
  payment: {
    title: "Оплата",
    courierPayment: "К оплате при получении",
    returnedTotal: "Итого по аренде",
    returnedHint: "Аренда завершена",
    cancelledTitle: "Оплата не требуется",
    cancelledHint: "Бронь отменена",
  },
  nextSteps: {
    pending: [
      "Проверим наличие",
      "Подтвердим время",
      "Подготовим доставку",
    ],
    confirmed: [
      "Вещь закреплена за вами",
      "Курьер привезёт её в выбранный интервал",
      "Оплата будет при получении",
    ],
    delivery: [
      "Курьер готовит передачу",
      "Держите телефон рядом",
      "Оплата при получении",
    ],
    active: [
      "Пользуйтесь вещью",
      "Верните её до окончания срока",
      "Для продления свяжитесь с поддержкой",
    ],
    returned: [
      "Аренда завершена",
      "Можно оставить оценку",
      "Можно оформить новую бронь",
    ],
    cancelled: [
      "Бронь отменена",
      "Можно выбрать вещь заново",
      "Новая бронь оформляется из каталога",
    ],
  } satisfies Record<OrderStatus, string[]>,
};
