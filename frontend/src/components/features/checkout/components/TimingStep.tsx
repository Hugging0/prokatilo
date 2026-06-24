import { CalendarDays, Clock3, PackageCheck } from "lucide-react";

import { getTariffPrice, TARIFFS } from "@/lib/tariffs";
import type { AppItem, TariffType } from "@/types";

import { DatePickerButton } from "./DatePickerButton";
import { CheckoutPanel } from "./CheckoutPanel";
import { InlineWarning } from "./InlineWarning";
import { PanelLabel } from "./PanelLabel";
import { StepTitle } from "./StepTitle";
import {
  formatDeliveryIntervalLabel,
  getQuickDateOptions,
} from "../lib/delivery-intervals";

export function TimingStep({
  selectedItem,
  selectedTariff,
  selectedDate,
  selectedTime,
  availableIntervals,
  isBookingsLoading,
  bookingsError,
  isPeriodValid,
  hasConflict,
  onStartChange,
  onTariffChange,
}: {
  selectedItem: AppItem;
  selectedTariff: TariffType;
  selectedDate: string;
  selectedTime: string;
  availableIntervals: string[];
  isBookingsLoading: boolean;
  bookingsError: string | null;
  isPeriodValid: boolean;
  hasConflict: boolean;
  onStartChange: (date: string, time?: string, tariff?: TariffType) => void;
  onTariffChange: (tariff: TariffType) => void;
}) {
  return (
    <section>
      <StepTitle
        title="Когда привезти?"
        subtitle="Выберите удобный интервал"
      />

      <div className="mt-7 space-y-6">
        <CheckoutPanel>
          <PanelLabel icon={CalendarDays} label="Дата доставки" />
          <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
            {getQuickDateOptions().map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => onStartChange(option.value)}
                className={`shrink-0 rounded-2xl border px-4 py-3 text-base font-black transition ${
                  selectedDate === option.value
                    ? "border-slate-900 bg-slate-900 text-white"
                    : "border-slate-100 bg-slate-50 text-slate-700"
                }`}
              >
                {option.label}
              </button>
            ))}
            <DatePickerButton
              value={selectedDate}
              onChange={(value) => onStartChange(value)}
            />
          </div>
        </CheckoutPanel>

        <CheckoutPanel>
          <PanelLabel icon={Clock3} label="Окно доставки" />
          {isBookingsLoading && (
            <p className="mt-4 text-sm font-bold text-slate-400">
              Проверяем занятость…
            </p>
          )}
          {!isBookingsLoading && bookingsError && (
            <p className="mt-4 text-sm font-bold text-rose-500">
              {bookingsError}
            </p>
          )}
          {!isBookingsLoading && !bookingsError && (
            <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
              {availableIntervals.map((time) => (
                <button
                  key={time}
                  type="button"
                  onClick={() => onStartChange(selectedDate, time)}
                  className={`rounded-2xl border px-3 py-3 text-base font-black transition ${
                    selectedTime === time
                      ? "border-slate-900 bg-slate-900 text-white"
                      : "border-slate-100 bg-slate-50 text-slate-700"
                  }`}
                >
                  {formatDeliveryIntervalLabel(time)}
                </button>
              ))}
              {availableIntervals.length === 0 && (
                <p className="col-span-full rounded-2xl bg-slate-50 px-4 py-4 text-base font-bold text-slate-500">
                  На эту дату свободных интервалов нет.
                </p>
              )}
            </div>
          )}
        </CheckoutPanel>

        <CheckoutPanel>
          <PanelLabel icon={PackageCheck} label="Срок аренды" />
          <div className="mt-4 grid grid-cols-3 gap-2">
            {TARIFFS.map((tariff) => (
              <button
                key={tariff.id}
                type="button"
                onClick={() => onTariffChange(tariff.id)}
                className={`rounded-2xl border px-3 py-3 text-left transition ${
                  selectedTariff === tariff.id
                    ? "border-slate-900 bg-slate-900 text-white"
                    : "border-slate-100 bg-slate-50 text-slate-700"
                }`}
              >
                <span className="block text-base font-black">
                  {tariff.id === "24h" ? "1 день" : tariff.label}
                </span>
                <span className="mt-1 block text-sm font-bold opacity-70">
                  {getTariffPrice(selectedItem, tariff.id)} ₽
                </span>
              </button>
            ))}
          </div>
          <p className="mt-4 rounded-2xl bg-orange-50 px-4 py-3 text-sm font-bold leading-relaxed text-orange-700">
            Срок аренды начнется после передачи вещи.
          </p>
        </CheckoutPanel>

        {!isPeriodValid && (
          <InlineWarning text="Конец аренды должен быть позже доставки." />
        )}
        {hasConflict && (
          <InlineWarning text="Выбранный период пересекается с другой бронью." />
        )}
      </div>
    </section>
  );
}
