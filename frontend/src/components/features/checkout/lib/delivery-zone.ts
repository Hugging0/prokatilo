export type DeliveryZoneKind =
  | "empty"
  | "free"
  | "nearby"
  | "moscow"
  | "outside"
  | "manual";

export interface DeliveryEstimate {
  kind: DeliveryZoneKind;
  title: string;
  priceLabel: string;
  description: string;
  shortNote: string;
  isExactFree: boolean;
  needsOperatorConfirmation: boolean;
}

const FREE_ZONE_KEYWORDS = [
  "очаково",
  "матвеевск",
  "малая очаковская",
  "большая очаковская",
  "озерная",
  "наташи ковшовой",
  "пржевальского",
  "вейерная",
  "матвеевская",
  "нежинская",
  "аминьевское",
  "аминьевская",
];

const NEARBY_ZONE_KEYWORDS = [
  "солнцево",
  "раменки",
  "никулино",
  "тропарево",
  "тропарёво",
  "мичуринский",
  "верейская",
  "ломоносовский",
  "давыдково",
];

const OUTSIDE_MKAD_KEYWORDS = [
  "за мкад",
  "область",
  "химки",
  "коммунарка",
  "одинцово",
  "красногорск",
  "мытищи",
  "балашиха",
  "люберцы",
  "реутов",
  "видное",
  "долгопрудный",
  "котельники",
  "новая москва",
  "новомосковский",
  "московская область",
];

const MOSCOW_KEYWORDS = [
  "москва",
  "мск",
  "цао",
  "зао",
  "юзао",
  "сзао",
  "сао",
  "свао",
  "вао",
  "ювао",
  "юао",
  "ул ",
  "улица",
  "проспект",
  "шоссе",
  "переулок",
  "бульвар",
  "набережная",
];

const MOSCOW_STREET_KEYWORDS = [
  "профсоюзная",
  "ленинский",
  "кутузовский",
  "вернадского",
  "лобачевского",
  "мичуринский",
  "аминьевское",
  "рублевское",
  "можайское",
  "варшавское",
  "каширское",
  "дмитровское",
  "ленинградское",
  "волоколамское",
  "садовое",
];

function normalizeAddress(address: string) {
  return address
    .trim()
    .toLocaleLowerCase("ru-RU")
    .replaceAll("ё", "е")
    .replace(/[.,;:()]/g, " ")
    .replace(/\s+/g, " ");
}

function containsAny(value: string, keywords: string[]) {
  return keywords.some((keyword) => value.includes(keyword));
}

function looksLikeStreetAndHouse(value: string) {
  return /[а-яa-z]{3,}.*\d|\d.*[а-яa-z]{3,}/i.test(value);
}

function startsWithMoscow(value: string) {
  return value.startsWith("москва") || value.startsWith("мск");
}

export function getAddressSuggestions(address: string): string[] {
  const trimmedAddress = address.trim().replace(/\s+/g, " ");
  const normalizedAddress = normalizeAddress(trimmedAddress);

  if (
    trimmedAddress.length < 3 ||
    startsWithMoscow(normalizedAddress) ||
    containsAny(normalizedAddress, OUTSIDE_MKAD_KEYWORDS)
  ) {
    return [];
  }

  if (
    looksLikeStreetAndHouse(normalizedAddress) ||
    containsAny(normalizedAddress, FREE_ZONE_KEYWORDS) ||
    containsAny(normalizedAddress, NEARBY_ZONE_KEYWORDS) ||
    containsAny(normalizedAddress, MOSCOW_STREET_KEYWORDS)
  ) {
    return [`Москва, ${trimmedAddress}`];
  }

  return [];
}

export function getDeliveryEstimate({
  address,
}: {
  address: string;
}): DeliveryEstimate {
  const normalizedAddress = normalizeAddress(address);

  if (normalizedAddress.length < 5) {
    return {
      kind: "empty",
      title: "Укажите адрес",
      priceLabel: "Пока не считаем",
      description:
        "Введите улицу и дом, а оператор подтвердит заказ и детали доставки.",
      shortNote: "Введите улицу и дом.",
      isExactFree: false,
      needsOperatorConfirmation: false,
    };
  }

  if (containsAny(normalizedAddress, OUTSIDE_MKAD_KEYWORDS)) {
    return {
      kind: "outside",
      title: "За МКАД",
      priceLabel: "По согласованию",
      description:
        "Доставка и забор за пределами МКАД согласуются отдельно с оператором.",
      shortNote: "Оператор согласует доставку.",
      isExactFree: false,
      needsOperatorConfirmation: true,
    };
  }

  if (containsAny(normalizedAddress, FREE_ZONE_KEYWORDS)) {
    return {
      kind: "free",
      title: "Быстрая зона",
      priceLabel: "Бесплатно",
      description:
        "До 3 км от Малой Очаковской. Обычно привозим быстрее обычного.",
      shortNote: "Быстрая зона.",
      isExactFree: true,
      needsOperatorConfirmation: false,
    };
  }

  if (containsAny(normalizedAddress, NEARBY_ZONE_KEYWORDS)) {
    return {
      kind: "nearby",
      title: "Ближняя зона",
      priceLabel: "300–500 ₽",
      description:
        "До 7 км от Малой Очаковской. Оператор подтвердит точную стоимость.",
      shortNote: "Точную стоимость подтвердит оператор.",
      isExactFree: false,
      needsOperatorConfirmation: true,
    };
  }

  if (
    containsAny(normalizedAddress, MOSCOW_KEYWORDS) ||
    containsAny(normalizedAddress, MOSCOW_STREET_KEYWORDS) ||
    looksLikeStreetAndHouse(normalizedAddress)
  ) {
    return {
      kind: "moscow",
      title: "Москва",
      priceLabel: "300–700 ₽",
      description:
        "В пределах МКАД стоимость зависит от маршрута. Оператор подтвердит после брони.",
      shortNote: "Точную стоимость подтвердит оператор.",
      isExactFree: false,
      needsOperatorConfirmation: true,
    };
  }

  return {
    kind: "manual",
    title: "Нужно уточнить район",
    priceLabel: "Уточним",
    description:
      "Если адрес не в быстрой зоне, оператор перезвонит и согласует доставку.",
    shortNote: "Оператор уточнит доставку.",
    isExactFree: false,
    needsOperatorConfirmation: true,
  };
}
