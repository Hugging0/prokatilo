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

export function getDeliveryEstimate({
  address,
  clarifyAddress,
}: {
  address: string;
  clarifyAddress: boolean;
}): DeliveryEstimate {
  if (clarifyAddress) {
    return {
      kind: "manual",
      title: "Адрес уточнит оператор",
      priceLabel: "Уточним",
      description:
        "После брони оператор перезвонит, уточнит адрес, стоимость и время доставки.",
      isExactFree: false,
      needsOperatorConfirmation: true,
    };
  }

  const normalizedAddress = normalizeAddress(address);

  if (normalizedAddress.length < 5) {
    return {
      kind: "empty",
      title: "Укажите адрес",
      priceLabel: "Пока не считаем",
      description:
        "Введите улицу и дом. Мы покажем ориентир по стоимости доставки.",
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
      isExactFree: false,
      needsOperatorConfirmation: true,
    };
  }

  if (containsAny(normalizedAddress, MOSCOW_KEYWORDS)) {
    return {
      kind: "moscow",
      title: "Москва",
      priceLabel: "300–700 ₽",
      description:
        "В пределах МКАД стоимость зависит от маршрута. Оператор подтвердит после брони.",
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
    isExactFree: false,
    needsOperatorConfirmation: true,
  };
}
