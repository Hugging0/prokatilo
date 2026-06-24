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
    slogan: "Вещи рядом, когда понадобились",
    serviceBadge: "Без залога",
    searchPlaceholder: "Найти вещь",
    emptyCatalog: "Пока ничего не нашли",
    catalogLoading: "Загружаем вещи…",
    catalogLoadError:
      "Не получилось загрузить каталог. Попробуйте ещё раз.",
  },
  checkout: {
    title: "Оформление",
    deliveryTitle: "Доставка",
    deliveryDescription: "Выберите время и адрес — мы подтвердим бронь.",
    addressLabel: "Адрес",
    addressPlaceholder: "Улица, дом, квартира",
    addressFallback: "Адрес можно уточнить после брони",
    paymentTitle: "Оплата",
    paymentDisclaimer:
      "Оплата при получении. В приложении деньги не списываются.",
    submitButton: "Забронировать",
    submittingButton: "Бронируем…",
    paymentRedirect: "Переходим к оплате…",
  },
  legal: {
    registrationAgreement:
      "Я принимаю Пользовательское соглашение и даю согласие на обработку персональных данных в соответствии с Политикой обработки персональных данных.",
    registrationAgreementHint:
      "Примите условия, чтобы создать аккаунт.",
  },
  orders: {
    title: "Мои бронирования",
    empty: "Бронирований пока нет",
    loading: "Загружаем бронирования…",
    loadError:
      "Не получилось загрузить бронирования. Попробуйте ещё раз.",
    tariffLabel: "Тариф",
    paymentLabel: "Оплата",
    paymentStatusLabel: "Статус оплаты",
    deliveryLabel: "Доставка",
    priceLabel: "Итого",
    customerLabel: "Клиент",
    phoneLabel: "Телефон",
    dateLabel: "Дата",
    supportButton: "Написать в поддержку",
    reviewTitle: "Как прошла аренда?",
    reviewThanks: "Спасибо за отзыв",
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
    price24hLabel: "Цена за день",
    price7dLabel: "Цена за неделю",
    activeLabel: "Показывать в каталоге",
    availableLabel: "Доступен для аренды",
    catalogLoadError:
      "Не удалось загрузить каталог. Проверьте ключ доступа.",
    ordersLoading: "Загружаем заявки…",
    ordersLoadError:
      "Не удалось загрузить заявки. Проверьте ключ доступа.",
    promoCodesTitle: "Промокоды",
    createPromoCode: "Создать промокод",
    editPromoCode: "Редактировать промокод",
    promoCodeLabel: "Код",
    promoTitleLabel: "Название",
    promoDescriptionLabel: "Описание",
    promoKindLabel: "Тип промокода",
    discountPercentLabel: "Скидка, %",
    discountAmountLabel: "Скидка, ₽",
    bonusAmountLabel: "Бонусы",
    minOrderAmountLabel: "Минимальная сумма заказа",
    maxUsesLabel: "Лимит использований",
    maxUsesPerUserLabel: "Лимит на клиента",
    validFromLabel: "Действует с",
    validUntilLabel: "Действует до",
    activePromoLabel: "Активен",
    archivePromoCode: "Отключить",
    promoCodesEmpty: "Промокодов пока нет",
  },
  profile: {
    notificationsTitle: "Уведомления",
    notificationsEnabled: "Push-уведомления включены. Сообщим о статусах броней.",
    notificationsDefault: "Включите уведомления, чтобы не пропустить бронь и доставку.",
    notificationsDenied: "Уведомления запрещены в браузере. Разрешите их в настройках сайта.",
    notificationsUnsupported: "Этот браузер не поддерживает push-уведомления.",
    enableNotifications: "Включить",
    disableNotifications: "Выключить",
    operatorModeTitle: "Администрирование",
    operatorModeHint: "Управление каталогом и заявками",
    adminAccountTitle: "Админский аккаунт",
    adminAccountHint: "Каталог и заявки доступны через нижнюю навигацию",
    customerAccountTitle: "Клиентский аккаунт",
    customerAccountHint: "Здесь хранятся ваши брони и контактные данные",
    enabled: "Вкл",
    disabled: "Выкл",
  },
  bonus: {
    title: "Бонусы ПРОКАТило",
    subtitle: "Возвращаем 5% бонусами",
    balanceMeta: "Можно списать при следующей аренде",
    rateHint: "1 бонус = 1 ₽",
    promoTitle: "Промокод",
    promoDescription: "Введите код и получите скидку или бонусы.",
    promoPlaceholder: "Введите код",
    activateButton: "Активировать",
    rulesTitle: "Как это работает",
    ruleEarn: "Начисляем 5% после завершённой аренды",
    ruleSpend: "Бонусами можно оплатить часть следующей брони",
    rulePromo: "Промокоды дают скидку или бонусы",
    historyTitle: "История бонусов",
    emptyHistoryTitle: "Операций пока нет",
    emptyHistoryDescription:
      "После первой аренды здесь появятся начисления и списания.",
    loginRequired: "Войдите, чтобы пользоваться бонусами",
    loading: "Загружаем бонусы…",
    loadError:
      "Не получилось загрузить бонусы. Попробуйте ещё раз.",
  },
  toast: {
    invalidPhone: "Введите корректный номер телефона",
    invalidEmail: "Введите корректный email",
    invalidPassword: "Пароль должен быть не короче 6 символов",
    welcomeBack: "С возвращением!",
    registered: "Аккаунт создан",
    selectItemFirst: "Сначала выберите вещь",
    loginRequired: "Войдите, чтобы продолжить бронирование",
    bookingCreated: "Бронь отправлена. Скоро подтвердим детали",
    paymentCreated: "Бронь создана, переходим к оплате",
    bookingError:
      "Не удалось отправить бронь. Проверьте соединение и попробуйте ещё раз.",
    statusUpdated: "Статус обновлён",
    reviewThanks: "Спасибо за отзыв",
    addressUpdated: "Адрес доставки обновлён",
    addressUpdateError: "Не удалось изменить адрес",
    orderCancelled: "Бронь отменена",
    orderCancelError: "Не удалось отменить бронь",
    promoActivated: "Промокод активирован",
    promoActivationError: "Не удалось активировать промокод",
    loyaltyReloaded: "Бонусы обновлены",
  },
};

export const PAYMENT_METHOD_OPTIONS: Array<{
  id: PaymentMethod;
  label: string;
  note: string;
}> = [
  {
    id: "cash",
    label: "Курьеру при получении",
    note: "При получении вещи от курьера",
  },
];

export function getPaymentMethodLabel(method: PaymentMethod): string {
  switch (method) {
    case "sbp":
    case "card":
    case "cash":
      return "Курьеру при получении";
  }
}
