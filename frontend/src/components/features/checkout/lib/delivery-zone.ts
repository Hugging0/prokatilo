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

type DeliveryPricingRule = {
  keywords: string[];
  price: number;
};

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

const NEARBY_ZONE_RULES: DeliveryPricingRule[] = [
  { keywords: ["верейская", "давыдково", "никулино"], price: 300 },
  { keywords: ["раменки", "мичуринский"], price: 400 },
  { keywords: ["солнцево", "тропарево", "тропарёво", "ломоносовский"], price: 500 },
];

const NEARBY_ZONE_KEYWORDS = NEARBY_ZONE_RULES.flatMap(
  (rule) => rule.keywords,
);

const MOSCOW_STREET_RULES: DeliveryPricingRule[] = [
  { keywords: ["вернадского", "лобачевского", "рублевское", "рублёвское"], price: 500 },
  { keywords: ["ленинский", "кутузовский", "можайское", "волоколамское"], price: 600 },
  {
    keywords: [
      "профсоюзная",
      "варшавское",
      "каширское",
      "дмитровское",
      "ленинградское",
      "садовое",
    ],
    price: 700,
  },
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

const MOSCOW_STREET_KEYWORDS = MOSCOW_STREET_RULES.flatMap(
  (rule) => rule.keywords,
);

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

function formatDeliveryPrice(price: number) {
  return `${price} ₽`;
}

function findDeliveryPrice(
  value: string,
  rules: DeliveryPricingRule[],
): number | null {
  return rules.find((rule) => containsAny(value, rule.keywords))?.price ?? null;
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
      priceLabel: formatDeliveryPrice(0),
      description: "Введите улицу и дом — покажем условия доставки.",
      shortNote: "Введите улицу и дом.",
      isExactFree: true,
      needsOperatorConfirmation: false,
    };
  }

  if (containsAny(normalizedAddress, OUTSIDE_MKAD_KEYWORDS)) {
    return {
      kind: "outside",
      title: "За городом",
      priceLabel: "Стоимость доставки уточнит оператор",
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
      priceLabel: formatDeliveryPrice(0),
      description: "Если адрес в быстрой зоне, привезём без доплаты.",
      shortNote: "Доставка без доплаты.",
      isExactFree: true,
      needsOperatorConfirmation: false,
    };
  }

  const nearbyPrice = findDeliveryPrice(normalizedAddress, NEARBY_ZONE_RULES);

  if (nearbyPrice !== null) {
    return {
      kind: "nearby",
      title: "Ближняя зона",
      priceLabel: formatDeliveryPrice(nearbyPrice),
      description: "Стоимость зависит от адреса и маршрута.",
      shortNote: "Стоимость зависит от маршрута.",
      isExactFree: false,
      needsOperatorConfirmation: false,
    };
  }

  const moscowPrice = findDeliveryPrice(normalizedAddress, MOSCOW_STREET_RULES);

  if (moscowPrice !== null) {
    return {
      kind: "moscow",
      title: "По городу",
      priceLabel: formatDeliveryPrice(moscowPrice),
      description: "Стоимость зависит от адреса и маршрута.",
      shortNote: "Стоимость зависит от маршрута.",
      isExactFree: false,
      needsOperatorConfirmation: false,
    };
  }

  if (
    containsAny(normalizedAddress, MOSCOW_KEYWORDS) ||
    looksLikeStreetAndHouse(normalizedAddress)
  ) {
    return {
      kind: "manual",
      title: "Уточним район",
      priceLabel: "Стоимость доставки уточнит оператор",
      description: "Адрес проверим отдельно.",
      shortNote: "Стоимость доставки уточнит оператор.",
      isExactFree: false,
      needsOperatorConfirmation: true,
    };
  }

  return {
    kind: "manual",
    title: "Уточним район",
    priceLabel: "Стоимость доставки уточнит оператор",
    description: "Адрес проверим отдельно.",
    shortNote: "Стоимость доставки уточнит оператор.",
    isExactFree: false,
    needsOperatorConfirmation: true,
  };
}
