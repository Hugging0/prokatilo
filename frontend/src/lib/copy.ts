import type { PaymentMethod } from "@/types";

export const UI_COPY = {
  auth: {
    subtitle: "Сервис проката вещей",
    phoneLabel: "Номер телефона",
    loginButton: "Войти",
  },
  home: {
    slogan: "Аренда без залога",
    serviceBadge: "Доставим за 15 мин",
    searchPlaceholder: "Что хотите арендовать?",
    emptyCatalog: "Ничего не найдено",
    catalogLoading: "Загружаем каталог…",
    catalogFallback:
      "Каталог временно показан из демо-данных",
  },
  checkout: {
    title: "Оформление",
    deliveryTitle: "Доставка",
    deliveryDescription:
      "Курьер привезёт вещь после подтверждения брони оператором.",
    addressLabel: "Адрес доставки",
    addressPlaceholder: "Например: ул. Ленина, 10, кв. 25",
    addressFallback: "Адрес уточнит оператор после подтверждения",
    paymentTitle: "Способ оплаты",
    paymentDisclaimer:
      "Сейчас деньги не списываются. Оплату подтвердим после проверки наличия.",
    submitButton: "Создать бронь",
  },
  orders: {
    title: "Мои брони",
    empty: "Броней пока нет",
    tariffLabel: "Тариф",
    paymentLabel: "Оплата",
    deliveryLabel: "Доставка",
    priceLabel: "К оплате",
    supportButton: "Связаться с сервисом",
    reviewTitle: "Аренда завершена! Оцените прокат:",
    reviewThanks: "Ваш отзыв учтён",
  },
  operator: {
    navLabel: "Оператор",
    title: "Заявки и аренды",
    catalogTitle: "Каталог",
    settingsTitle: "Настройки",
    subtitle: "Оператор сервиса",
    empty: "Пока нет заявок",
    clientLabel: "Клиент",
    accessTitle: "Доступ оператора",
    accessHint:
      "Ключ нужен для управления каталогом и хранится только в этом браузере.",
    accessKeyLabel: "Ключ доступа",
    saveAccessKey: "Сохранить ключ",
    clearAccessKey: "Сбросить ключ",
    addItem: "Добавить товар",
    editItem: "Редактировать",
    hideItem: "Скрыть",
    restoreItem: "Вернуть в каталог",
    deleteItem: "Удалить",
    saveItem: "Сохранить товар",
    createItem: "Создать товар",
    cancelEdit: "Отмена",
  },
  profile: {
    operatorModeTitle: "Режим оператора",
    operatorModeHint: "Только для тестирования MVP",
    enabled: "Вкл",
    disabled: "Выкл",
  },
  bonus: {
    comingSoon: "Скоро добавим бонусы",
  },
  toast: {
    invalidPhone: "Введите корректный номер телефона",
    welcomeBack: "С возвращением!",
    selectItemFirst: "Сначала выберите вещь и войдите в аккаунт",
    bookingCreated: "Бронь создана, скоро подтвердим",
    reviewThanks: "Спасибо за отзыв! ⭐",
  },
};

export const PAYMENT_METHOD_OPTIONS: Array<{
  id: PaymentMethod;
  label: string;
  note: string;
}> = [
  {
    id: "sbp",
    label: "СБП / Т-Банк / Сбер",
    note: "Быстрое подтверждение после проверки брони",
  },
  {
    id: "card",
    label: "Картой",
    note: "Оплата после подтверждения оператором",
  },
  {
    id: "cash",
    label: "Наличными",
    note: "При получении вещи от курьера",
  },
];

export function getPaymentMethodLabel(method: PaymentMethod): string {
  switch (method) {
    case "sbp":
      return "СБП / Т-Банк / Сбер";
    case "card":
      return "Картой";
    case "cash":
      return "Наличными";
  }
}
