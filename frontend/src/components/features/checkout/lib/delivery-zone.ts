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
      description: "Введите улицу и дом — покажем условия доставки.",
      shortNote: "Введите улицу и дом.",
      isExactFree: false,
      needsOperatorConfirmation: false,
    };
  }

  if (containsAny(normalizedAddress, OUTSIDE_MKAD_KEYWORDS)) {
    return {
      kind: "outside",
      title: "За городом",
      priceLabel: "По согласованию",
      description: "Доставку и забор согласуем отдельно.",
      shortNote: "Согласуем доставку отдельно.",
      isExactFree: false,
      needsOperatorConfirmation: true,
    };
  }

  if (containsAny(normalizedAddress, FREE_ZONE_KEYWORDS)) {
    return {
      kind: "free",
      title: "Рядом с нами",
      priceLabel: "Бесплатно",
      description: "Если адрес в быстрой зоне, привезём без доплаты.",
      shortNote: "Доставка без доплаты.",
      isExactFree: true,
      needsOperatorConfirmation: false,
    };
  }

  if (containsAny(normalizedAddress, NEARBY_ZONE_KEYWORDS)) {
    return {
      kind: "nearby",
      title: "Ближняя зона",
      priceLabel: "300–500 ₽",
      description: "Стоимость зависит от адреса. Подтвердим её после брони.",
      shortNote: "Стоимость подтвердим после брони.",
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
      title: "По городу",
      priceLabel: "300–700 ₽",
      description: "Стоимость зависит от маршрута. Подтвердим её после брони.",
      shortNote: "Стоимость подтвердим после брони.",
      isExactFree: false,
      needsOperatorConfirmation: true,
    };
  }

  return {
    kind: "manual",
    title: "Уточним район",
    priceLabel: "Уточним",
    description: "После брони проверим адрес и условия доставки.",
    shortNote: "Проверим условия доставки.",
    isExactFree: false,
    needsOperatorConfirmation: true,
  };
}
