import type { PaymentMethod } from "@/types";

export const UI_COPY = {
  auth: {
    subtitle: "Сервис проката вещей",
    loginTab: "Вход",
    registerTab: "Регистрация",
    emailPlaceholder: "Email",
    passwordPlaceholder: "Пароль",
    namePlaceholder: "Имя",
    phonePlaceholder: "Телефон для связи",
    phoneLabel: "Телефон",
    loginButton: "Войти",
    registerButton: "Создать аккаунт",
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
      "Онлайн-оплата проходит через YooKassa. Наличные можно оплатить курьеру при получении.",
    submitButton: "Создать бронь",
    paymentRedirect: "Переходим к оплате…",
  },
  orders: {
    title: "Мои брони",
    empty: "Броней пока нет",
    loading: "Загружаем ваши брони…",
    loadError:
      "Не удалось загрузить брони. Проверьте соединение и попробуйте снова.",
    tariffLabel: "Тариф",
    paymentLabel: "Оплата",
    paymentStatusLabel: "Статус оплаты",
    deliveryLabel: "Доставка",
    priceLabel: "К оплате",
    customerLabel: "Клиент",
    phoneLabel: "Телефон",
    dateLabel: "Дата",
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
    newItem: "Новый товар",
    saveChanges: "Сохранить изменения",
    editItemTitle: "Редактирование товара",
    newItemTitle: "Новый товар",
    cancelEdit: "Отменить редактирование",
    discardChanges: "Отменить изменения?",
    titleLabel: "Название",
    descriptionLabel: "Описание",
    categoryLabel: "Категория",
    iconLabel: "Иконка",
    imageUrlLabel: "URL изображения",
    sortOrderLabel: "Порядок отображения",
    price3hLabel: "Цена за 3 часа",
    price6hLabel: "Цена за 6 часов",
    price24hLabel: "Цена за сутки",
    activeLabel: "Показывать в каталоге",
    availableLabel: "Доступен для аренды",
    catalogLoadError:
      "Не удалось загрузить каталог. Проверьте ключ доступа.",
    ordersLoading: "Загружаем заявки…",
    ordersLoadError:
      "Не удалось загрузить заявки. Проверьте ключ доступа.",
  },
  profile: {
    operatorModeTitle: "Режим оператора",
    operatorModeHint: "Только для тестирования MVP",
    adminAccountTitle: "Админский аккаунт",
    adminAccountHint: "Каталог и заявки доступны через нижнюю навигацию",
    customerAccountTitle: "Клиентский аккаунт",
    customerAccountHint: "Здесь хранятся ваши брони и контактные данные",
    enabled: "Вкл",
    disabled: "Выкл",
  },
  bonus: {
    comingSoon: "Скоро добавим бонусы",
  },
  toast: {
    invalidPhone: "Введите корректный номер телефона",
    invalidEmail: "Введите корректный email",
    invalidPassword: "Пароль должен быть не короче 6 символов",
    welcomeBack: "С возвращением!",
    registered: "Аккаунт создан",
    selectItemFirst: "Сначала выберите вещь и войдите в аккаунт",
    loginRequired: "Войдите в аккаунт, чтобы создать бронь",
    bookingCreated: "Бронь создана, скоро подтвердим",
    paymentCreated: "Бронь создана, переходим к оплате",
    bookingError:
      "Не удалось создать бронь. Проверьте соединение или попробуйте позже.",
    statusUpdated: "Статус заявки обновлён",
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
