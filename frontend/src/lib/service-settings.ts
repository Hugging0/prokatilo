import type { PublicServiceSettingsDto } from "@/types";
import { BUSINESS_TELEGRAM_URL } from "@/lib/business";

export const DEFAULT_PUBLIC_SERVICE_SETTINGS: PublicServiceSettingsDto = {
  timezone: "Europe/Moscow",
  workday_start: "08:00",
  workday_end: "20:00",
  delivery_slot_minutes: 120,
  min_order_lead_minutes: 15,
  support_phone: null,
  support_telegram_url: BUSINESS_TELEGRAM_URL,
  service_is_active: true,
  service_pause_message: null,
  cash_enabled: true,
  card_enabled: false,
  sbp_enabled: false,
  default_payment_method: "cash",
  cashback_percent: 5,
  max_bonus_spend_percent: 30,
  bonus_to_ruble_rate: 1,
};
