import { ArrowLeft, Calendar as CalendarIcon } from "lucide-react";

import {
  formatRentalPeriod,
  getDayInterval,
  getPresetEndInputValues,
  getRentalDurationLabel,
  getSelectedRentalInterval,
  intervalsOverlap,
} from "@/lib/booking-time";
import { getRentalTotalPrice, getTariffPrice, TARIFFS } from "@/lib/tariffs";
import type { AppItem, BookingSlot, TariffType } from "@/types";

interface DetailsViewProps {
  item: AppItem;
  selectedTariff: TariffType;
  selectedDate: string;
  selectedTime: string;
  selectedEndDate: string;
  selectedEndTime: string;
  bookingSlots: BookingSlot[];
  isBookingsLoading: boolean;
  bookingsError: string | null;
  onBack: () => void;
  onCheckout: () => void;
  onTariffChange: (tariff: TariffType) => void;
  onDateChange: (date: string) => void;
  onTimeChange: (time: string) => void;
  onEndDateChange: (date: string) => void;
  onEndTimeChange: (time: string) => void;
}

export function DetailsView({
  item,
  selectedTariff,
  selectedDate,
  selectedTime,
  selectedEndDate,
  selectedEndTime,
  bookingSlots,
  isBookingsLoading,
  bookingsError,
  onBack,
  onCheckout,
  onTariffChange,
  onDateChange,
  onTimeChange,
  onEndDateChange,
  onEndTimeChange,
}: DetailsViewProps) {
  const selectedInterval = getSelectedRentalInterval(
    selectedDate,
    selectedTime,
    selectedEndDate,
    selectedEndTime,
  );
  const selectedDayInterval = getDayInterval(selectedDate);
  const visibleBookingSlots = selectedDayInterval
    ? bookingSlots.filter((slot) =>
        intervalsOverlap(
          selectedDayInterval.startAt,
          selectedDayInterval.endAt,
          new Date(slot.rentalStartAt),
          new Date(slot.rentalEndAt),
        ),
      )
    : bookingSlots;
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
  const isSelectedSlotBusy = conflictingBookingSlots.length > 0;
  const isPeriodValid =
    Boolean(selectedInterval) &&
    selectedInterval !== null &&
    selectedInterval.endAt > selectedInterval.startAt;
  const totalPrice = getRentalTotalPrice(
    item,
    selectedTariff,
    selectedInterval?.startAt ?? null,
    selectedInterval?.endAt ?? null,
  );
  const canContinue = item.available && isPeriodValid && !isSelectedSlotBusy;

  const applyTariffPreset = (
    tariff: TariffType,
    startDate = selectedDate,
    startTime = selectedTime,
  ) => {
    onTariffChange(tariff);
    const presetEnd = getPresetEndInputValues(startDate, startTime, tariff);

    if (presetEnd) {
      onEndDateChange(presetEnd.endDate);
      onEndTimeChange(presetEnd.endTime);
    }
  };

  const handleStartDateChange = (value: string) => {
    onDateChange(value);
    const presetEnd = getPresetEndInputValues(
      value,
      selectedTime,
      selectedTariff,
    );

    if (presetEnd) {
      onEndDateChange(presetEnd.endDate);
      onEndTimeChange(presetEnd.endTime);
    }
  };

  const handleStartTimeChange = (value: string) => {
    onTimeChange(value);
    const presetEnd = getPresetEndInputValues(
      selectedDate,
      value,
      selectedTariff,
    );

    if (presetEnd) {
      onEndDateChange(presetEnd.endDate);
      onEndTimeChange(presetEnd.endTime);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 pb-32">
      <section className="relative min-h-[300px] bg-white">
        <button
          type="button"
          onClick={onBack}
          className="absolute top-12 left-6 z-20 rounded-2xl bg-white/95 p-3 shadow-lg active:scale-95"
        >
          <ArrowLeft size={22} />
        </button>

        {item.imageUrl ? (
          <div className="h-[330px] w-full overflow-hidden rounded-b-[2.5rem] bg-slate-100">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={item.imageUrl}
              alt={item.title}
              className="h-full w-full object-cover"
            />
          </div>
        ) : (
          <div
            className={`flex h-[330px] w-full items-center justify-center rounded-b-[2.5rem] ${item.bg}`}
          >
            <item.icon size={92} strokeWidth={1.3} className={item.color} />
          </div>
        )}
      </section>

      <section className="relative z-10 -mt-8 px-6">
        <div className="rounded-[2rem] border border-slate-100 bg-white p-6 shadow-xl shadow-slate-200/60">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
            {item.category}
          </p>
          <h2 className="mt-3 text-3xl font-black leading-none tracking-tight text-slate-900">
            {item.title}
          </h2>
          <p className="mt-4 text-sm font-medium leading-relaxed text-slate-500">
            {item.desc}
          </p>

          <div className="mt-7">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
              Стоимость
            </p>
            <div className="mt-3 grid grid-cols-3 gap-2">
              {TARIFFS.map((tariff) => (
                <button
                  key={tariff.id}
                  type="button"
                  onClick={() => applyTariffPreset(tariff.id)}
                  className={`rounded-2xl border px-3 py-3 text-left transition ${
                    selectedTariff === tariff.id
                      ? "border-slate-900 bg-slate-900 text-white"
                      : "border-slate-100 bg-slate-50 text-slate-700"
                  }`}
                >
                  <span className="block text-[10px] font-black uppercase tracking-wide opacity-70">
                    {tariff.label}
                  </span>
                  <span className="mt-1 block text-lg font-black leading-none">
                    {getTariffPrice(item, tariff.id)}₽
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="mt-7 rounded-[1.5rem] border border-slate-100 bg-slate-50 p-4">
            <div className="mb-4 flex items-center justify-between gap-3">
              <p className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
                <CalendarIcon size={15} />
                Период и занятость
              </p>
              <span className="text-xs font-black text-slate-500">
                {getRentalDurationLabel(
                  selectedInterval?.startAt ?? null,
                  selectedInterval?.endAt ?? null,
                )}
              </span>
            </div>

            <div className="grid gap-3">
              <div className="grid grid-cols-[56px_1fr_96px] items-center gap-2">
                <span className="text-xs font-black text-slate-400">
                  Начало
                </span>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(event) => handleStartDateChange(event.target.value)}
                  className="min-w-0 rounded-2xl border border-slate-100 bg-white px-3 py-3 text-sm font-bold text-slate-700 outline-none focus:border-slate-300"
                />
                <input
                  type="time"
                  value={selectedTime}
                  onChange={(event) => handleStartTimeChange(event.target.value)}
                  className="min-w-0 rounded-2xl border border-slate-100 bg-white px-3 py-3 text-sm font-bold text-slate-700 outline-none focus:border-slate-300"
                />
              </div>
              <div className="grid grid-cols-[56px_1fr_96px] items-center gap-2">
                <span className="text-xs font-black text-slate-400">
                  Конец
                </span>
                <input
                  type="date"
                  value={selectedEndDate}
                  onChange={(event) => onEndDateChange(event.target.value)}
                  className="min-w-0 rounded-2xl border border-slate-100 bg-white px-3 py-3 text-sm font-bold text-slate-700 outline-none focus:border-slate-300"
                />
                <input
                  type="time"
                  value={selectedEndTime}
                  onChange={(event) => onEndTimeChange(event.target.value)}
                  className="min-w-0 rounded-2xl border border-slate-100 bg-white px-3 py-3 text-sm font-bold text-slate-700 outline-none focus:border-slate-300"
                />
              </div>
            </div>

            <div className="mt-5 border-t border-slate-200/70 pt-4">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                Занято рядом
              </p>

              {isBookingsLoading && (
                <p className="mt-2 text-sm font-bold text-slate-400">
                  Проверяем календарь…
                </p>
              )}

              {!isBookingsLoading && bookingsError && (
                <p className="mt-2 text-sm font-bold text-rose-500">
                  {bookingsError}
                </p>
              )}

              {!isBookingsLoading &&
                !bookingsError &&
                visibleBookingSlots.length === 0 && (
                  <p className="mt-2 text-sm font-bold text-emerald-600">
                    На выбранный день броней нет
                  </p>
                )}

              {!isBookingsLoading &&
                !bookingsError &&
                visibleBookingSlots.length > 0 && (
                  <div className="mt-3 grid gap-2">
                    {visibleBookingSlots.map((slot) => {
                      const isConflict = conflictingBookingSlots.some(
                        (conflict) => conflict.orderId === slot.orderId,
                      );

                      return (
                        <div
                          key={slot.orderId}
                          className={`rounded-2xl px-3 py-2 text-xs font-black ${
                            isConflict
                              ? "bg-rose-100 text-rose-700"
                              : "bg-white text-slate-500"
                          }`}
                        >
                          {formatRentalPeriod(
                            slot.rentalStartAt,
                            slot.rentalEndAt,
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
            </div>
          </div>

          {selectedInterval && !isPeriodValid && (
            <p className="mt-4 rounded-2xl bg-rose-50 px-4 py-3 text-sm font-bold text-rose-600">
              Конец аренды должен быть позже начала.
            </p>
          )}

          {isSelectedSlotBusy && (
            <p className="mt-4 rounded-2xl bg-rose-50 px-4 py-3 text-sm font-bold text-rose-600">
              Выбранный период пересекается с бронью.
            </p>
          )}

          <div className="mt-7 flex items-center justify-between gap-4">
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                Итого
              </p>
              <p className="mt-1 text-2xl font-black text-slate-900">
                {totalPrice}₽
              </p>
            </div>
            <button
              type="button"
              onClick={onCheckout}
              disabled={!canContinue}
              className="rounded-2xl bg-slate-900 px-6 py-4 text-sm font-black text-white shadow-lg shadow-slate-200 active:scale-95 disabled:bg-slate-200 disabled:text-slate-400 disabled:shadow-none"
            >
              Оформить
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}
