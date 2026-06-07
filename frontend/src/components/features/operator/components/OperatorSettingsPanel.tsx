"use client";

import type { ReactNode } from "react";
import { useCallback, useEffect, useState } from "react";
import {
  Banknote,
  Check,
  Clock3,
  CreditCard,
  Gift,
  Loader2,
  Phone,
  Save,
  Settings,
} from "lucide-react";

import { AppBadge } from "@/components/ui/AppBadge";
import { AppButton } from "@/components/ui/AppButton";
import { AppCard } from "@/components/ui/AppCard";
import { AppNotice } from "@/components/ui/AppNotice";
import {
  getAdminServiceSettings,
  updateAdminServiceSettings,
} from "@/lib/api/admin-settings";
import type { PaymentMethod } from "@/types";

import {
  DEFAULT_SERVICE_SETTINGS_FORM,
  mapSettingsDtoToForm,
  mapSettingsFormToPayload,
  validateSettingsForm,
  type ServiceSettingsFormState,
} from "../lib/settings-form.utils";

interface OperatorSettingsPanelProps {
  authToken: string;
}

interface SettingsFieldProps {
  label: string;
  hint?: string;
  children: ReactNode;
}

const TEXT_INPUT_CLASS =
  "min-h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-base font-bold text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-orange-300 focus:ring-4 focus:ring-orange-100";

const NUMBER_INPUT_CLASS =
  "min-h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-base font-black text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-orange-300 focus:ring-4 focus:ring-orange-100";

const PAYMENT_METHODS: Array<{
  value: PaymentMethod;
  label: string;
  hint: string;
}> = [
  { value: "cash", label: "Курьеру", hint: "Основной режим сейчас" },
  { value: "card", label: "Карта", hint: "Заготовка под онлайн" },
  { value: "sbp", label: "СБП", hint: "Пока не показываем клиенту" },
];

function SettingsField({ label, hint, children }: SettingsFieldProps) {
  return (
    <label className="flex flex-col gap-2">
      <span className="text-sm font-black text-slate-700">{label}</span>
      {children}
      {hint && <span className="text-sm font-bold text-slate-500">{hint}</span>}
    </label>
  );
}

function ToggleRow({
  checked,
  label,
  hint,
  onChange,
}: {
  checked: boolean;
  label: string;
  hint: string;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="flex min-h-16 cursor-pointer items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm transition hover:border-orange-200">
      <span className="flex flex-col gap-1">
        <span className="text-base font-black text-slate-950">{label}</span>
        <span className="text-sm font-bold leading-relaxed text-slate-500">
          {hint}
        </span>
      </span>
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="size-5 rounded border-slate-300 text-orange-500 focus:ring-orange-200"
      />
    </label>
  );
}

function SectionHeader({
  icon,
  title,
  description,
}: {
  icon: ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <span className="inline-flex size-11 shrink-0 items-center justify-center rounded-2xl bg-orange-50 text-orange-600">
        {icon}
      </span>
      <div>
        <h3 className="text-lg font-black tracking-tight text-slate-950">
          {title}
        </h3>
        <p className="mt-1 text-sm font-bold leading-relaxed text-slate-500">
          {description}
        </p>
      </div>
    </div>
  );
}

export function OperatorSettingsPanel({
  authToken,
}: OperatorSettingsPanelProps) {
  const [form, setForm] = useState<ServiceSettingsFormState>(
    DEFAULT_SERVICE_SETTINGS_FORM,
  );
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const refreshSettings = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setMessage(null);

    try {
      const settings = await getAdminServiceSettings(authToken);
      setForm(mapSettingsDtoToForm(settings));
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Не удалось загрузить настройки сервиса",
      );
    } finally {
      setIsLoading(false);
    }
  }, [authToken]);

  useEffect(() => {
    const timerId = window.setTimeout(() => {
      void refreshSettings();
    }, 0);

    return () => window.clearTimeout(timerId);
  }, [refreshSettings]);

  const updateField = <Field extends keyof ServiceSettingsFormState>(
    field: Field,
    value: ServiceSettingsFormState[Field],
  ) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const saveSettings = async () => {
    const validationError = validateSettingsForm(form);
    setError(validationError);
    setMessage(null);

    if (validationError) {
      return;
    }

    setIsSaving(true);

    try {
      const settings = await updateAdminServiceSettings(
        authToken,
        mapSettingsFormToPayload(form),
      );
      setForm(mapSettingsDtoToForm(settings));
      setMessage("Настройки сохранены");
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Не удалось сохранить настройки",
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <section className="flex flex-col gap-5">
      <AppCard className="flex flex-col gap-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-black tracking-tight text-slate-950">
              Настройки сервиса
            </h2>
            <p className="mt-1 text-base font-bold leading-relaxed text-slate-500">
              Рабочие часы, способы оплаты и бонусная логика сервиса.
            </p>
          </div>
          <AppBadge className="w-fit bg-emerald-50 text-emerald-700">
            {form.service_is_active ? "Сервис активен" : "Сервис на паузе"}
          </AppBadge>
        </div>

        {isLoading && (
          <AppNotice className="flex items-center gap-3">
            <Loader2 className="size-5 animate-spin" />
            Загружаем настройки
          </AppNotice>
        )}

        {error && <AppNotice tone="danger">{error}</AppNotice>}
      </AppCard>

      <AppCard className="flex flex-col gap-5">
        <SectionHeader
          icon={<Settings size={20} />}
          title="Сервис"
          description="Публичная доступность приложения и контакт поддержки."
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <ToggleRow
            checked={form.service_is_active}
            label="Принимать брони"
            hint="Если выключить, сервис можно временно поставить на паузу."
            onChange={(checked) => updateField("service_is_active", checked)}
          />
          <SettingsField
            label="Телефон поддержки"
            hint="Показывается оператору и в сервисных подсказках."
          >
            <input
              type="tel"
              value={form.support_phone}
              onChange={(event) =>
                updateField("support_phone", event.target.value)
              }
              className={TEXT_INPUT_CLASS}
              placeholder="+7 999 000-00-00"
            />
          </SettingsField>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <SettingsField label="Часовой пояс">
            <input
              type="text"
              value={form.timezone}
              onChange={(event) => updateField("timezone", event.target.value)}
              className={TEXT_INPUT_CLASS}
              placeholder="Europe/Moscow"
            />
          </SettingsField>
          <SettingsField label="Сообщение при паузе">
            <input
              type="text"
              value={form.service_pause_message}
              onChange={(event) =>
                updateField("service_pause_message", event.target.value)
              }
              className={TEXT_INPUT_CLASS}
              placeholder="Сегодня не принимаем новые брони"
            />
          </SettingsField>
        </div>
      </AppCard>

      <AppCard className="flex flex-col gap-5">
        <SectionHeader
          icon={<Clock3 size={20} />}
          title="Доставка"
          description="Окна доставки и минимальное время до ближайшей заявки."
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <SettingsField label="Начало рабочего дня">
            <input
              type="time"
              value={form.workday_start}
              onChange={(event) =>
                updateField("workday_start", event.target.value)
              }
              className={TEXT_INPUT_CLASS}
            />
          </SettingsField>
          <SettingsField label="Конец рабочего дня">
            <input
              type="time"
              value={form.workday_end}
              onChange={(event) =>
                updateField("workday_end", event.target.value)
              }
              className={TEXT_INPUT_CLASS}
            />
          </SettingsField>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <SettingsField label="Интервал доставки, минут">
            <input
              type="number"
              min="15"
              max="240"
              value={form.delivery_slot_minutes}
              onChange={(event) =>
                updateField("delivery_slot_minutes", event.target.value)
              }
              className={NUMBER_INPUT_CLASS}
            />
          </SettingsField>
          <SettingsField label="Минимум до заказа, минут">
            <input
              type="number"
              min="0"
              max="1440"
              value={form.min_order_lead_minutes}
              onChange={(event) =>
                updateField("min_order_lead_minutes", event.target.value)
              }
              className={NUMBER_INPUT_CLASS}
            />
          </SettingsField>
        </div>
      </AppCard>

      <AppCard className="flex flex-col gap-5">
        <SectionHeader
          icon={<CreditCard size={20} />}
          title="Оплата"
          description="Пока клиентская логика остается про оплату курьеру."
        />
        <div className="grid gap-3">
          <ToggleRow
            checked={form.cash_enabled}
            label="Оплата курьеру"
            hint="Рекомендуемый активный способ для текущего запуска."
            onChange={(checked) => updateField("cash_enabled", checked)}
          />
          <ToggleRow
            checked={form.card_enabled}
            label="Карта"
            hint="Можно включить позже, когда вернем онлайн-оплату."
            onChange={(checked) => updateField("card_enabled", checked)}
          />
          <ToggleRow
            checked={form.sbp_enabled}
            label="СБП"
            hint="Храним настройку, но не выводим клиенту до отдельного релиза."
            onChange={(checked) => updateField("sbp_enabled", checked)}
          />
        </div>
        <div className="flex flex-col gap-3">
          <span className="text-sm font-black text-slate-700">
            Способ по умолчанию
          </span>
          <div className="grid gap-3 sm:grid-cols-3">
            {PAYMENT_METHODS.map((method) => (
              <button
                key={method.value}
                type="button"
                onClick={() =>
                  updateField("default_payment_method", method.value)
                }
                className={`flex min-h-20 flex-col items-start gap-1 rounded-2xl border p-4 text-left transition ${
                  form.default_payment_method === method.value
                    ? "border-orange-300 bg-orange-50 text-orange-900"
                    : "border-slate-200 bg-white text-slate-700"
                }`}
              >
                <span className="flex items-center gap-2 text-base font-black">
                  {method.value === "cash" && <Banknote size={18} />}
                  {method.value === "card" && <CreditCard size={18} />}
                  {method.value === "sbp" && <Phone size={18} />}
                  {method.label}
                </span>
                <span className="text-sm font-bold leading-relaxed text-slate-500">
                  {method.hint}
                </span>
              </button>
            ))}
          </div>
        </div>
      </AppCard>

      <AppCard className="flex flex-col gap-5">
        <SectionHeader
          icon={<Gift size={20} />}
          title="Бонусы"
          description="Единые правила начисления и списания бонусов."
        />
        <div className="grid gap-4 sm:grid-cols-3">
          <SettingsField label="Кэшбэк, %">
            <input
              type="number"
              min="0"
              max="100"
              value={form.cashback_percent}
              onChange={(event) =>
                updateField("cashback_percent", event.target.value)
              }
              className={NUMBER_INPUT_CLASS}
            />
          </SettingsField>
          <SettingsField label="Оплата бонусами, %">
            <input
              type="number"
              min="0"
              max="100"
              value={form.max_bonus_spend_percent}
              onChange={(event) =>
                updateField("max_bonus_spend_percent", event.target.value)
              }
              className={NUMBER_INPUT_CLASS}
            />
          </SettingsField>
          <SettingsField label="Бонусов за 1 рубль">
            <input
              type="number"
              min="1"
              max="100"
              value={form.bonus_to_ruble_rate}
              onChange={(event) =>
                updateField("bonus_to_ruble_rate", event.target.value)
              }
              className={NUMBER_INPUT_CLASS}
            />
          </SettingsField>
        </div>
      </AppCard>

      <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
        <AppButton
          type="button"
          variant="secondary"
          onClick={() => void refreshSettings()}
          disabled={isSaving || isLoading}
        >
          Обновить
        </AppButton>
        <AppButton
          type="button"
          onClick={() => void saveSettings()}
          disabled={isSaving || isLoading}
        >
          {isSaving ? (
            <Loader2 className="size-5 animate-spin" />
          ) : (
            <Save className="size-5" />
          )}
          Сохранить
        </AppButton>
      </div>

      {message && (
        <div className="flex items-center gap-2 text-base font-black text-emerald-700">
          <Check className="size-5" />
          {message}
        </div>
      )}
    </section>
  );
}
