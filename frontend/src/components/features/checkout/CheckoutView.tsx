import { useEffect, useId, useState, type ReactNode } from "react";
import { ArrowLeft, CalendarDays, ChevronRight, Clock3, type LucideIcon, MapPin, PackageCheck } from "lucide-react";

import { BRAND_GRADIENT } from "@/lib/brand";
import {
  formatDateInputValue,
  getDateTimeFromInputs,
  getPresetEndInputValues,
  getRentalDurationLabel,
  getSelectedRentalInterval,
  intervalsOverlap,
} from "@/lib/booking-time";
import { getRentalTotalPrice, getTariffPrice, TARIFFS } from "@/lib/tariffs";
import type { AppItem, BookingSlot, TariffType } from "@/types";

interface CheckoutViewProps {
  selectedItem: AppItem;
  selectedTariff: TariffType;
  selectedDate: string;
  selectedTime: string;
  selectedEndDate: string;
  selectedEndTime: string;
  deliveryAddress: string;
  courierComment: string;
  clarifyAddress: boolean;
  bookingSlots: BookingSlot[];
  isBookingsLoading: boolean;
  bookingsError: string | null;
  isSubmitting: boolean;
  onBack: () => void;
  onTariffChange: (tariff: TariffType) => void;
  onDateChange: (date: string) => void;
  onTimeChange: (time: string) => void;
  onEndDateChange: (date: string) => void;
  onEndTimeChange: (time: string) => void;
  onDeliveryAddressChange: (address: string) => void;
  onCourierCommentChange: (comment: string) => void;
  onClarifyAddressChange: (value: boolean) => void;
  onSubmit: () => void;
}

const DELIVERY_INTERVALS = [
  "08:00",
  "10:00",
  "12:00",
  "14:00",
  "16:00",
  "18:00",
] as const;

const DELIVERY_INTERVAL_HOURS = 2;
const checkoutDateFormatter = new Intl.DateTimeFormat("ru-RU", {
  day: "numeric",
  month: "long",
  timeZone: "Europe/Moscow",
});

export function CheckoutView({
  selectedItem,
  selectedTariff,
  selectedDate,
  selectedTime,
  selectedEndDate,
  selectedEndTime,
  deliveryAddress,
  courierComment,
  clarifyAddress,
  bookingSlots,
  isBookingsLoading,
  bookingsError,
  isSubmitting,
  onBack,
  onTariffChange,
  onDateChange,
  onTimeChange,
  onEndDateChange,
  onEndTimeChange,
  onDeliveryAddressChange,
  onCourierCommentChange,
  onClarifyAddressChange,
  onSubmit,
}: CheckoutViewProps) {
  const [step, setStep] = useCheckoutStep();
  const selectedInterval = getSelectedRentalInterval(
    selectedDate,
    selectedTime,
    selectedEndDate,
    selectedEndTime,
  );
  const totalPrice = getRentalTotalPrice(
    selectedItem,
    selectedTariff,
    selectedInterval?.startAt ?? null,
    selectedInterval?.endAt ?? null,
  );
  const conflictingBookingSlots = selectedInterval
    ? bookingSlots.filter((slot) =>
        intervalsOverlap(
          selectedInterval.startAt,
          selectedInterval.endAt,
          new Date(slot.rentalStartAt),
          new Date(slot.rentalEndAt),
        ),
      )
    : [];
  const hasConflict = conflictingBookingSlots.length > 0;
  const isPeriodValid = Boolean(selectedInterval && selectedInterval.endAt > selectedInterval.startAt);
  const canGoNextFromTiming = selectedItem.available && isPeriodValid && !hasConflict;
  const canGoNextFromAddress = clarifyAddress || deliveryAddress.trim().length >= 5;
  const availableIntervals = DELIVERY_INTERVALS.filter((time) =>
    isDeliveryIntervalAvailable(
      selectedDate,
      time,
      selectedTariff,
      bookingSlots,
    ),
  );
  const isSelectedTimeAvailable = availableIntervals.includes(
    selectedTime as (typeof DELIVERY_INTERVALS)[number],
  );

  const updateStart = (nextDate: string, nextTime = selectedTime, nextTariff = selectedTariff) => {
    onDateChange(nextDate);
    onTimeChange(nextTime);
    const presetEnd = getPresetEndInputValues(nextDate, nextTime, nextTariff);

    if (presetEnd) {
      onEndDateChange(presetEnd.endDate);
      onEndTimeChange(presetEnd.endTime);
    }
  };

  useEffect(() => {
    if (
      step !== 1 ||
      isBookingsLoading ||
      bookingsError ||
      availableIntervals.length === 0 ||
      isSelectedTimeAvailable
    ) {
      return;
    }

    updateStart(selectedDate, availableIntervals[0]);
  }, [
    availableIntervals,
    bookingsError,
    isBookingsLoading,
    isSelectedTimeAvailable,
    selectedDate,
    step,
  ]);

  const selectTariff = (tariff: TariffType) => {
    onTariffChange(tariff);
    const presetEnd = getPresetEndInputValues(selectedDate, selectedTime, tariff);

    if (presetEnd) {
      onEndDateChange(presetEnd.endDate);
      onEndTimeChange(presetEnd.endTime);
    }
  };

  const rentalDurationSummary = getRentalDurationLabel(
    selectedInterval?.startAt ?? null,
    selectedInterval?.endAt ?? null,
  );
  const deliveryIntervalSummary = selectedInterval
    ? `${formatDeliveryDateLabel(
        selectedInterval.startAt,
      )}, ${formatDeliveryIntervalLabel(selectedTime)}`
    : "Выберите интервал доставки";
  const bottomSummary = selectedInterval
    ? `Доставка: ${deliveryIntervalSummary} · аренда: ${rentalDurationSummary}`
    : "Выберите период аренды";

  return (
    <main className="min-h-screen bg-slate-50 pb-36">
      <header className="sticky top-0 z-30 border-b border-slate-100 bg-slate-50/95 px-6 py-4 backdrop-blur">
        <div className="mx-auto flex max-w-2xl items-center justify-between gap-4">
          <button
            type="button"
            onClick={step === 1 ? onBack : () => setStep((current) => current - 1)}
            className="rounded-2xl bg-white p-3 text-slate-900 shadow-sm active:scale-95"
            aria-label="Назад"
          >
            <ArrowLeft size={21} />
          </button>
          <div className="text-center">
            <p className="text-xs font-black tracking-[0.22em] text-slate-900">
              ПРОКАТИЛО
            </p>
            <p className="mt-1 text-[11px] font-bold text-slate-400">
              {step} из 4
            </p>
          </div>
          <div className="h-11 w-11" />
        </div>
      </header>

      <div className="mx-auto max-w-2xl px-6 pt-7">
        {step === 1 && (
          <section>
            <StepTitle
              title="Когда нужна вещь?"
              subtitle="Выберите дату, интервал и длительность"
            />

            <div className="mt-7 space-y-6">
              <Panel>
                <PanelLabel icon={CalendarDays} label="Дата доставки" />
                <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
                  {getQuickDateOptions().map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => updateStart(option.value)}
                      className={`shrink-0 rounded-2xl border px-4 py-3 text-sm font-black transition ${
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
                    onChange={(value) => updateStart(value)}
                  />
                </div>
              </Panel>

              <Panel>
                <PanelLabel icon={Clock3} label="Интервал доставки" />
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
                        onClick={() => updateStart(selectedDate, time)}
                        className={`rounded-2xl border px-3 py-3 text-sm font-black transition ${
                          selectedTime === time
                            ? "border-slate-900 bg-slate-900 text-white"
                            : "border-slate-100 bg-slate-50 text-slate-700"
                        }`}
                      >
                        {formatDeliveryIntervalLabel(time)}
                      </button>
                    ))}
                    {availableIntervals.length === 0 && (
                      <p className="col-span-full rounded-2xl bg-slate-50 px-4 py-4 text-sm font-bold text-slate-500">
                        На эту дату свободных интервалов нет.
                      </p>
                    )}
                  </div>
                )}
              </Panel>

              <Panel>
                <PanelLabel icon={PackageCheck} label="Длительность" />
                <div className="mt-4 grid grid-cols-3 gap-2">
                  {TARIFFS.map((tariff) => (
                    <button
                      key={tariff.id}
                      type="button"
                      onClick={() => selectTariff(tariff.id)}
                      className={`rounded-2xl border px-3 py-3 text-left transition ${
                        selectedTariff === tariff.id
                          ? "border-slate-900 bg-slate-900 text-white"
                          : "border-slate-100 bg-slate-50 text-slate-700"
                      }`}
                    >
                      <span className="block text-sm font-black">
                        {tariff.id === "24h" ? "1 день" : tariff.label}
                      </span>
                      <span className="mt-1 block text-xs font-bold opacity-70">
                        {getTariffPrice(selectedItem, tariff.id)} ₽
                      </span>
                    </button>
                  ))}
                </div>
              </Panel>

              {!isPeriodValid && (
                <InlineWarning text="Конец аренды должен быть позже доставки." />
              )}
              {hasConflict && (
                <InlineWarning text="Выбранный период пересекается с другой бронью." />
              )}
            </div>
          </section>
        )}

        {step === 2 && (
          <section>
            <StepTitle
              title="Куда доставить?"
              subtitle="Укажите адрес или уточните с оператором"
            />

            <div className="mt-7 space-y-5">
              <Panel>
                <PanelLabel icon={MapPin} label="Адрес доставки" />
                <input
                  value={deliveryAddress}
                  onChange={(event) => onDeliveryAddressChange(event.target.value)}
                  disabled={clarifyAddress}
                  placeholder="Улица, дом, подъезд, квартира"
                  className="mt-4 w-full rounded-2xl border border-slate-100 bg-slate-50 px-4 py-4 text-sm font-bold text-slate-700 outline-none transition focus:border-slate-300 disabled:text-slate-300"
                />
                <textarea
                  value={courierComment}
                  onChange={(event) => onCourierCommentChange(event.target.value)}
                  placeholder="Комментарий курьеру"
                  rows={3}
                  className="mt-3 w-full resize-none rounded-2xl border border-slate-100 bg-slate-50 px-4 py-4 text-sm font-bold text-slate-700 outline-none transition focus:border-slate-300"
                />
              </Panel>

              <label className="flex cursor-pointer items-start gap-3 rounded-[1.5rem] border border-slate-100 bg-white p-5 shadow-sm">
                <input
                  type="checkbox"
                  checked={clarifyAddress}
                  onChange={(event) => onClarifyAddressChange(event.target.checked)}
                  className="mt-1 h-5 w-5 rounded border-slate-300 text-slate-900"
                />
                <span>
                  <span className="block text-sm font-black text-slate-900">
                    Уточнить адрес с оператором
                  </span>
                  <span className="mt-1 block text-sm font-bold text-slate-400">
                    Мы свяжемся после создания брони.
                  </span>
                </span>
              </label>
            </div>
          </section>
        )}

        {step === 3 && (
          <section>
            <StepTitle
              title="Проверьте бронь"
              subtitle="Убедитесь, что всё указано верно"
            />

            <div className="mt-7 space-y-4">
              <Panel>
                <div className="flex items-center gap-4">
                  {selectedItem.imageUrl ? (
                    <div className="h-16 w-16 overflow-hidden rounded-2xl bg-slate-100">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={selectedItem.imageUrl}
                        alt={selectedItem.title}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className={`flex h-16 w-16 items-center justify-center rounded-2xl ${selectedItem.bg} ${selectedItem.color}`}>
                      <selectedItem.icon size={30} />
                    </div>
                  )}
                  <div className="min-w-0">
                    <h3 className="truncate text-lg font-black text-slate-900">
                      {selectedItem.title}
                    </h3>
                    <p className="mt-1 text-sm font-bold text-slate-400">
                      {rentalDurationSummary} · {totalPrice} ₽
                    </p>
                  </div>
                </div>
              </Panel>

              <ReviewRow
                title="Интервал доставки"
                value={selectedInterval ? deliveryIntervalSummary : "Не выбрано"}
                onEdit={() => setStep(1)}
              />
              <ReviewRow
                title="Длительность аренды"
                value={selectedInterval ? rentalDurationSummary : "Не выбрано"}
                onEdit={() => setStep(1)}
              />
              <ReviewRow
                title="Доступность"
                value="Предварительно доступно. Оператор подтвердит бронь."
              />
              <ReviewRow
                title="Доставка"
                value={clarifyAddress ? "Адрес уточнит оператор" : deliveryAddress}
                onEdit={() => setStep(2)}
              />
              <ReviewRow
                title="Оплата"
                value="Оплата курьеру при получении товара. Сейчас деньги не списываются."
              />

              <Panel>
                <SummaryRow label="Аренда" value={`${totalPrice} ₽`} />
                <SummaryRow label="Доставка" value="0 ₽" />
                <SummaryRow label="К оплате курьеру" value={`${totalPrice} ₽`} strong />
              </Panel>
            </div>
          </section>
        )}

        {step === 4 && (
          <section>
            <StepTitle
              title="Что будет дальше?"
              subtitle="Бронь создаётся без списания денег"
            />

            <div className="mt-7 space-y-4">
              {[
                "Оператор проверит наличие, подтвердит бронь и позвонит вам.",
                "Курьер привезёт вещь в выбранный интервал.",
                "Оплата будет при получении товара курьеру.",
              ].map((text, index) => (
                <div
                  key={text}
                  className="flex gap-4 rounded-[1.5rem] border border-slate-100 bg-white p-5 shadow-sm"
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-900 text-sm font-black text-white">
                    {index + 1}
                  </span>
                  <p className="pt-1 text-sm font-bold leading-relaxed text-slate-700">
                    {text}
                  </p>
                </div>
              ))}

              <div className="rounded-[1.5rem] bg-emerald-50 p-5 text-sm font-bold leading-relaxed text-emerald-700">
                Сейчас деньги не списываются. Оплата только при получении товара.
              </div>
            </div>
          </section>
        )}
      </div>

      <footer className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-100 bg-white/95 px-6 py-4 shadow-2xl shadow-slate-300/40 backdrop-blur">
        <div className="mx-auto flex max-w-2xl items-center gap-4">
          <div className="min-w-0 flex-1">
            <p className="text-xl font-black text-slate-900">{totalPrice} ₽</p>
            <p className="mt-1 truncate text-xs font-bold text-slate-400">
              {step === 2 ? "С учётом доставки" : bottomSummary}
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              if (step === 4) {
                onSubmit();
                return;
              }
              setStep((current) => current + 1);
            }}
            disabled={
              isSubmitting ||
              (step === 1 && (!canGoNextFromTiming || availableIntervals.length === 0)) ||
              (step === 2 && !canGoNextFromAddress)
            }
            className={`flex shrink-0 items-center gap-2 rounded-2xl ${BRAND_GRADIENT} px-5 py-4 text-sm font-black text-white shadow-xl shadow-rose-200 active:scale-95 disabled:opacity-50`}
          >
            {isSubmitting ? "Создаём…" : getStepButtonLabel(step)}
            {step < 4 && <ChevronRight size={18} />}
          </button>
        </div>
      </footer>
    </main>
  );
}

function useCheckoutStep() {
  return useState(1);
}

function DatePickerButton({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const inputId = useId();

  return (
    <label
      htmlFor={inputId}
      className="relative flex shrink-0 cursor-pointer items-center gap-2 rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm font-black text-slate-700"
    >
      <CalendarDays size={16} />
      <span>Календарь</span>
      <input
        id={inputId}
        type="date"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="absolute inset-0 cursor-pointer opacity-0"
        aria-label="Выбрать дату"
      />
    </label>
  );
}

function getQuickDateOptions() {
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  return [
    { label: "Сегодня", value: formatDateInputValue(today) },
    { label: "Завтра", value: formatDateInputValue(tomorrow) },
    { label: "Сб", value: getNextWeekdayInputValue(6) },
    { label: "Вс", value: getNextWeekdayInputValue(0) },
  ];
}

function getNextWeekdayInputValue(weekday: number) {
  const date = new Date();
  const daysAhead = (weekday - date.getDay() + 7) % 7 || 7;
  date.setDate(date.getDate() + daysAhead);
  return formatDateInputValue(date);
}

function formatDeliveryIntervalLabel(startTime: string) {
  const [hourValue] = startTime.split(":");
  const startHour = Number(hourValue);
  const endHour = startHour + DELIVERY_INTERVAL_HOURS;
  return `${startTime}–${String(endHour).padStart(2, "0")}:00`;
}

function formatDeliveryDateLabel(value: Date) {
  return checkoutDateFormatter.format(value);
}

function isDeliveryIntervalAvailable(
  selectedDate: string,
  selectedTime: string,
  selectedTariff: TariffType,
  bookingSlots: BookingSlot[],
) {
  const startAt = getDateTimeFromInputs(selectedDate, selectedTime);
  const presetEnd = getPresetEndInputValues(selectedDate, selectedTime, selectedTariff);
  const endAt = presetEnd
    ? getDateTimeFromInputs(presetEnd.endDate, presetEnd.endTime)
    : null;

  if (!startAt || !endAt) {
    return false;
  }

  return !bookingSlots.some((slot) =>
    intervalsOverlap(
      startAt,
      endAt,
      new Date(slot.rentalStartAt),
      new Date(slot.rentalEndAt),
    ),
  );
}

function getStepButtonLabel(step: number) {
  switch (step) {
    case 1:
      return "Далее: адрес";
    case 2:
      return "Далее: проверить";
    case 3:
      return "Далее";
    default:
      return "Хорошо";
  }
}

function StepTitle({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div>
      <h2 className="text-3xl font-black leading-none tracking-tight text-slate-900">
        {title}
      </h2>
      <p className="mt-3 text-sm font-bold text-slate-400">{subtitle}</p>
    </div>
  );
}

function Panel({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-[1.5rem] border border-slate-100 bg-white p-5 shadow-sm">
      {children}
    </div>
  );
}

function PanelLabel({
  icon: Icon,
  label,
}: {
  icon: LucideIcon;
  label: string;
}) {
  return (
    <p className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
      <Icon size={15} />
      {label}
    </p>
  );
}

function InlineWarning({ text }: { text: string }) {
  return (
    <p className="rounded-2xl bg-rose-50 px-4 py-3 text-sm font-bold text-rose-600">
      {text}
    </p>
  );
}

function ReviewRow({
  title,
  value,
  onEdit,
}: {
  title: string;
  value: string;
  onEdit?: () => void;
}) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-[1.5rem] border border-slate-100 bg-white p-5 shadow-sm">
      <div>
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
          {title}
        </p>
        <p className="mt-2 text-sm font-bold leading-relaxed text-slate-800">
          {value}
        </p>
      </div>
      {onEdit && (
        <button
          type="button"
          onClick={onEdit}
          className="shrink-0 rounded-full bg-slate-50 px-3 py-2 text-xs font-black text-slate-500"
        >
          Изм.
        </button>
      )}
    </div>
  );
}

function SummaryRow({
  label,
  value,
  strong = false,
}: {
  label: string;
  value: string;
  strong?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-slate-100 py-3 last:border-b-0">
      <span className="text-sm font-bold text-slate-400">{label}</span>
      <span className={`text-sm ${strong ? "font-black text-slate-900" : "font-bold text-slate-700"}`}>
        {value}
      </span>
    </div>
  );
}
