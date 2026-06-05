import type {
  AdminServiceSettingsPayload,
  BackendServiceSettingsDto,
  PaymentMethod,
} from "@/types";

export interface ServiceSettingsFormState {
  timezone: string;
  workday_start: string;
  workday_end: string;
  delivery_slot_minutes: string;
  min_order_lead_minutes: string;
  support_phone: string;
  service_is_active: boolean;
  service_pause_message: string;
  cash_enabled: boolean;
  card_enabled: boolean;
  sbp_enabled: boolean;
  default_payment_method: PaymentMethod;
  cashback_percent: string;
  max_bonus_spend_percent: string;
  bonus_to_ruble_rate: string;
}

export const DEFAULT_SERVICE_SETTINGS_FORM: ServiceSettingsFormState = {
  timezone: "Europe/Moscow",
  workday_start: "08:00",
  workday_end: "20:00",
  delivery_slot_minutes: "120",
  min_order_lead_minutes: "15",
  support_phone: "",
  service_is_active: true,
  service_pause_message: "",
  cash_enabled: true,
  card_enabled: false,
  sbp_enabled: false,
  default_payment_method: "cash",
  cashback_percent: "5",
  max_bonus_spend_percent: "30",
  bonus_to_ruble_rate: "1",
};

const TIME_PATTERN = /^\d{2}:\d{2}$/;
const PAYMENT_ENABLED_KEY: Record<
  PaymentMethod,
  "cash_enabled" | "card_enabled" | "sbp_enabled"
> = {
  cash: "cash_enabled",
  card: "card_enabled",
  sbp: "sbp_enabled",
};

export function mapSettingsDtoToForm(
  settings: BackendServiceSettingsDto,
): ServiceSettingsFormState {
  return {
    timezone: settings.timezone,
    workday_start: settings.workday_start,
    workday_end: settings.workday_end,
    delivery_slot_minutes: String(settings.delivery_slot_minutes),
    min_order_lead_minutes: String(settings.min_order_lead_minutes),
    support_phone: settings.support_phone ?? "",
    service_is_active: settings.service_is_active,
    service_pause_message: settings.service_pause_message ?? "",
    cash_enabled: settings.cash_enabled,
    card_enabled: settings.card_enabled,
    sbp_enabled: settings.sbp_enabled,
    default_payment_method: settings.default_payment_method,
    cashback_percent: String(settings.cashback_percent),
    max_bonus_spend_percent: String(settings.max_bonus_spend_percent),
    bonus_to_ruble_rate: String(settings.bonus_to_ruble_rate),
  };
}

export function validateSettingsForm(
  form: ServiceSettingsFormState,
): string | null {
  if (!form.timezone.trim()) {
    return "Укажите часовой пояс сервиса";
  }

  if (
    !TIME_PATTERN.test(form.workday_start) ||
    !TIME_PATTERN.test(form.workday_end)
  ) {
    return "Рабочие часы нужно указать в формате ЧЧ:ММ";
  }

  if (form.workday_start >= form.workday_end) {
    return "Начало рабочего дня должно быть раньше окончания";
  }

  const slotMinutes = Number(form.delivery_slot_minutes);
  if (!Number.isInteger(slotMinutes) || slotMinutes < 15 || slotMinutes > 240) {
    return "Интервал доставки должен быть от 15 до 240 минут";
  }

  const leadMinutes = Number(form.min_order_lead_minutes);
  if (!Number.isInteger(leadMinutes) || leadMinutes < 0 || leadMinutes > 1440) {
    return "Минимальное время до заказа должно быть от 0 до 1440 минут";
  }

  const cashbackPercent = Number(form.cashback_percent);
  if (
    !Number.isInteger(cashbackPercent) ||
    cashbackPercent < 0 ||
    cashbackPercent > 100
  ) {
    return "Кэшбэк должен быть от 0 до 100%";
  }

  const maxBonusSpendPercent = Number(form.max_bonus_spend_percent);
  if (
    !Number.isInteger(maxBonusSpendPercent) ||
    maxBonusSpendPercent < 0 ||
    maxBonusSpendPercent > 100
  ) {
    return "Максимальная оплата бонусами должна быть от 0 до 100%";
  }

  const bonusRate = Number(form.bonus_to_ruble_rate);
  if (!Number.isInteger(bonusRate) || bonusRate < 1 || bonusRate > 100) {
    return "Курс бонусов должен быть от 1 до 100";
  }

  if (!form.cash_enabled && !form.card_enabled && !form.sbp_enabled) {
    return "Включите хотя бы один способ оплаты";
  }

  if (!form[PAYMENT_ENABLED_KEY[form.default_payment_method]]) {
    return "Способ оплаты по умолчанию должен быть включен";
  }

  return null;
}

export function mapSettingsFormToPayload(
  form: ServiceSettingsFormState,
): AdminServiceSettingsPayload {
  return {
    timezone: form.timezone.trim(),
    workday_start: form.workday_start,
    workday_end: form.workday_end,
    delivery_slot_minutes: Number(form.delivery_slot_minutes),
    min_order_lead_minutes: Number(form.min_order_lead_minutes),
    support_phone: form.support_phone.trim() || null,
    service_is_active: form.service_is_active,
    service_pause_message: form.service_pause_message.trim() || null,
    cash_enabled: form.cash_enabled,
    card_enabled: form.card_enabled,
    sbp_enabled: form.sbp_enabled,
    default_payment_method: form.default_payment_method,
    cashback_percent: Number(form.cashback_percent),
    max_bonus_spend_percent: Number(form.max_bonus_spend_percent),
    bonus_to_ruble_rate: Number(form.bonus_to_ruble_rate),
  };
}
