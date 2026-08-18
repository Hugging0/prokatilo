interface ApiValidationIssue {
  loc?: unknown[];
  msg?: unknown;
}

const API_FIELD_LABELS: Record<string, string> = {
  bonus_spend_amount: "количество бонусов",
  comment: "комментарий курьеру",
  customer_email: "email",
  customer_name: "имя",
  customer_phone: "телефон для связи",
  delivery_address: "адрес доставки",
  email: "email",
  item_id: "выбранная вещь",
  name: "имя",
  password: "пароль",
  payment_method: "способ оплаты",
  phone: "телефон для связи",
  promo_code: "промокод",
  rental_date: "дата аренды",
  rental_time: "время аренды",
  tariff_type: "тариф",
  total_price: "стоимость аренды",
};

function getIssueFieldLabel(issue: ApiValidationIssue): string | null {
  const field = issue.loc
    ?.slice()
    .reverse()
    .find((part): part is string => typeof part === "string" && part !== "body");

  return field ? API_FIELD_LABELS[field] ?? field : null;
}

export function normalizeApiErrorDetail(detail: unknown): string | null {
  if (typeof detail === "string" && detail.trim()) {
    return detail;
  }

  if (Array.isArray(detail)) {
    const fieldLabels = Array.from(
      new Set(
        detail
          .filter(
            (issue): issue is ApiValidationIssue =>
              typeof issue === "object" && issue !== null,
          )
          .map(getIssueFieldLabel)
          .filter((label): label is string => Boolean(label)),
      ),
    );

    if (fieldLabels.length === 1) {
      return `Проверьте поле «${fieldLabels[0]}».`;
    }

    if (fieldLabels.length > 1) {
      return `Проверьте поля: ${fieldLabels.join(", ")}.`;
    }

    const messages = detail.filter(
      (message): message is string =>
        typeof message === "string" && Boolean(message.trim()),
    );

    return messages.length > 0
      ? messages.join(". ")
      : "Проверьте введённые данные.";
  }

  if (typeof detail === "object" && detail !== null) {
    const message = (detail as { message?: unknown }).message;

    if (typeof message === "string" && message.trim()) {
      return message;
    }
  }

  return null;
}
