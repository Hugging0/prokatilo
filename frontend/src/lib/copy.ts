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
    slogan: "Аренда вещей рядом",
    serviceBadge: "Доставка от 15 мин",
    searchPlaceholder: "Что хотите арендовать?",
    emptyCatalog: "Ничего не найдено",
    catalogLoading: "Загружаем каталог…",
    catalogLoadError:
      "Не удалось загрузить каталог. Проверьте соединение и попробуйте снова.",
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
      "Оплата сейчас только курьеру при получении. В приложении деньги не списываются.",
    submitButton: "Создать бронь",
    paymentRedirect: "Переходим к оплате…",
  },
  legal: {
    registrationAgreement:
      "Я принимаю Пользовательское соглашение и даю согласие на обработку персональных данных в соответствии с Политикой обработки персональных данных.",
    registrationAgreementHint:
      "Примите условия, чтобы создать аккаунт.",
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
    subtitle: "5% возвращаем бонусами",
    balanceMeta: "Доступно бонусами",
    rateHint: "1 бонус = 1 ₽",
    promoTitle: "Промокод",
    promoDescription: "Введите код от сервиса и получите скидку или бонусы.",
    promoPlaceholder: "Введите код",
    activateButton: "Активировать",
    rulesTitle: "Как это работает",
    ruleEarn: "Получайте 5% с завершённых аренд",
    ruleSpend: "Списывайте бонусы при следующей брони",
    rulePromo: "Активируйте промокоды от сервиса",
    historyTitle: "История бонусов",
    emptyHistoryTitle: "Операций пока нет",
    emptyHistoryDescription:
      "После первой аренды здесь появятся начисления и списания.",
    loginRequired: "Войдите, чтобы пользоваться бонусами",
    loading: "Загружаем бонусы…",
    loadError:
      "Не удалось загрузить бонусы. Проверьте соединение и попробуйте снова.",
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
