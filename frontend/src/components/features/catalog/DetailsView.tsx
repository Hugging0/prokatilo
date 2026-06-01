import { ArrowLeft, Calendar as CalendarIcon, Timer } from "lucide-react";

import { getTariffPrice, TARIFFS } from "@/lib/tariffs";
import type { AppItem, BookingSlot, TariffType } from "@/types";

const APP_TIME_ZONE = "Europe/Moscow";
const APP_TIME_ZONE_OFFSET = "+03:00";
const TARIFF_DURATION_MS: Record<TariffType, number> = {
  "3h": 3 * 60 * 60 * 1000,
  "6h": 6 * 60 * 60 * 1000,
  "24h": 24 * 60 * 60 * 1000,
};

const timeFormatter = new Intl.DateTimeFormat("ru-RU", {
  hour: "2-digit",
  minute: "2-digit",
  timeZone: APP_TIME_ZONE,
});

const dateFormatter = new Intl.DateTimeFormat("ru-RU", {
  day: "numeric",
  month: "long",
  timeZone: APP_TIME_ZONE,
});

const dateTimeFormatter = new Intl.DateTimeFormat("ru-RU", {
  day: "numeric",
  month: "long",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: APP_TIME_ZONE,
});

interface DetailsViewProps {
  item: AppItem;
  selectedTariff: TariffType;
  selectedDate: string;
  selectedTime: string;
  bookingSlots: BookingSlot[];
  isBookingsLoading: boolean;
  bookingsError: string | null;
  onBack: () => void;
  onCheckout: () => void;
  onTariffChange: (tariff: TariffType) => void;
  onDateChange: (date: string) => void;
  onTimeChange: (time: string) => void;
}

export function DetailsView({
  item,
  selectedTariff,
  selectedDate,
  selectedTime,
  bookingSlots,
  isBookingsLoading,
  bookingsError,
  onBack,
  onCheckout,
  onTariffChange,
  onDateChange,
  onTimeChange,
}: DetailsViewProps) {
  const selectedInterval = getSelectedInterval(
    selectedDate,
    selectedTime,
    selectedTariff,
  );
  const selectedDayInterval = getSelectedDayInterval(selectedDate);
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
  const canContinue = item.available && !isSelectedSlotBusy;

  return (
    <main className="min-h-screen bg-white pb-32">
      <section
        className={`relative ${item.bg} min-h-[330px] rounded-b-[3rem] flex items-center justify-center`}
      >
        <button
          type="button"
          onClick={onBack}
          className="absolute top-12 left-6 z-20 bg-white/90 backdrop-blur-md p-3 rounded-2xl shadow-xl active:scale-90 transition-transform"
        >
          <ArrowLeft size={22} />
        </button>

        {item.imageUrl ? (
          <div className="h-full min-h-[330px] w-full overflow-hidden rounded-b-[3rem]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={item.imageUrl}
              alt={item.title}
              className="h-full min-h-[330px] w-full object-cover"
            />
            <div className="absolute inset-0 rounded-b-[3rem] bg-gradient-to-t from-black/30 via-transparent to-white/10" />
          </div>
        ) : (
          <item.icon size={96} strokeWidth={1.3} className={item.color} />
        )}
      </section>

      <section className="px-6 -mt-10 relative z-10">
        <div className="bg-white rounded-[2.5rem] p-6 shadow-xl shadow-slate-100 border border-slate-100">
          <p className="bg-slate-100 text-slate-500 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest mb-2 inline-block italic">
            {item.category}
          </p>

          <h2 className="text-3xl font-black text-slate-900 tracking-tighter leading-none mt-4">
            {item.title}
          </h2>

          <p className="text-slate-500 font-medium mt-4 leading-relaxed">
            {item.desc}
          </p>

          <div className="mt-8">
            <h3 className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] ml-1 flex items-center gap-2 mb-3">
              <CalendarIcon size={16} />
              Дата и время
            </h3>

            <div className="grid grid-cols-2 gap-3">
              <input
                type="date"
                value={selectedDate}
                onChange={(event) => onDateChange(event.target.value)}
                className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-4 px-4 text-sm font-bold focus:ring-2 ring-rose-500 outline-none"
              />
              <input
                type="time"
                value={selectedTime}
                onChange={(event) => onTimeChange(event.target.value)}
                className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-4 px-4 text-sm font-bold focus:ring-2 ring-rose-500 outline-none"
              />
            </div>

            <div className="mt-4 rounded-2xl border border-slate-100 bg-slate-50 p-4">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                Выбранный период
              </p>

              <p className="mt-2 text-sm font-black text-slate-900">
                {selectedInterval
                  ? formatBookingPeriod(
                      selectedInterval.startAt,
                      selectedInterval.endAt,
                    )
                  : "Выберите дату и время"}
              </p>

              {isSelectedSlotBusy && (
                <p className="mt-3 rounded-xl bg-rose-50 px-3 py-2 text-sm font-bold text-rose-600">
                  Это время пересекается с бронью. Выберите другой старт или
                  длительность.
                </p>
              )}

              <p className="mt-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                Занято в этот день
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
                  Пока свободно, можно бронировать
                </p>
              )}

              {!isBookingsLoading &&
                !bookingsError &&
                visibleBookingSlots.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {visibleBookingSlots.map((slot) => (
                    <span
                      key={slot.orderId}
                      className={`rounded-xl px-3 py-2 text-xs font-black shadow-sm ${
                        conflictingBookingSlots.some(
                          (conflict) => conflict.orderId === slot.orderId,
                        )
                          ? "bg-rose-100 text-rose-700"
                          : "bg-white text-slate-600"
                      }`}
                    >
                      {formatBookingPeriod(
                        new Date(slot.rentalStartAt),
                        new Date(slot.rentalEndAt),
                      )}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="mt-8">
            <h3 className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] ml-1 flex items-center gap-2 mb-3">
              <Timer size={16} />
              Длительность
            </h3>

            <div className="grid grid-cols-3 gap-3">
              {TARIFFS.map((tariff) => (
                <button
                  key={tariff.id}
                  type="button"
                  onClick={() => onTariffChange(tariff.id)}
                  className={`p-4 rounded-[1.5rem] border-2 text-center transition-all cursor-pointer ${
                    selectedTariff === tariff.id
                      ? "border-rose-500 bg-rose-50 text-rose-600 shadow-md scale-105 font-bold"
                      : "border-slate-50 bg-slate-50 opacity-70"
                  }`}
                >
                  <span
                    className={`block text-[9px] font-black uppercase tracking-tighter mb-1 ${
                      selectedTariff === tariff.id
                        ? "text-rose-400"
                        : "text-slate-400"
                    }`}
                  >
                    {tariff.label}
                  </span>
                  <span className="block text-lg font-black leading-none">
                    {getTariffPrice(item, tariff.id)}₽
                  </span>
                </button>
              ))}
            </div>
          </div>

          <button
            type="button"
            onClick={onCheckout}
            disabled={!canContinue}
            className="mt-8 w-full bg-slate-900 text-white py-6 rounded-[2rem] font-black text-lg shadow-2xl shadow-slate-300 active:scale-95 transition-transform disabled:bg-slate-200 disabled:text-slate-400 disabled:shadow-none"
          >
            {canContinue
              ? "Далее к оформлению"
              : isSelectedSlotBusy
                ? "Выберите свободное время"
                : "Сейчас недоступно"}
          </button>
        </div>
      </section>
    </main>
  );
}

function getSelectedInterval(
  selectedDate: string,
  selectedTime: string,
  selectedTariff: TariffType,
) {
  if (!selectedDate || !selectedTime) {
    return null;
  }

  const normalizedTime =
    selectedTime.length === 5 ? `${selectedTime}:00` : selectedTime;
  const startAt = new Date(
    `${selectedDate}T${normalizedTime}${APP_TIME_ZONE_OFFSET}`,
  );

  if (Number.isNaN(startAt.getTime())) {
    return null;
  }

  return {
    startAt,
    endAt: new Date(startAt.getTime() + TARIFF_DURATION_MS[selectedTariff]),
  };
}

function getSelectedDayInterval(selectedDate: string) {
  if (!selectedDate) {
    return null;
  }

  const startAt = new Date(`${selectedDate}T00:00:00${APP_TIME_ZONE_OFFSET}`);

  if (Number.isNaN(startAt.getTime())) {
    return null;
  }

  return {
    startAt,
    endAt: new Date(startAt.getTime() + 24 * 60 * 60 * 1000),
  };
}

function intervalsOverlap(
  firstStartAt: Date,
  firstEndAt: Date,
  secondStartAt: Date,
  secondEndAt: Date,
) {
  return firstStartAt < secondEndAt && firstEndAt > secondStartAt;
}

function formatBookingPeriod(startAt: Date, endAt: Date) {
  const isSameDay = dateFormatter.format(startAt) === dateFormatter.format(endAt);

  if (isSameDay) {
    return `${dateFormatter.format(startAt)}, ${timeFormatter.format(
      startAt,
    )}–${timeFormatter.format(endAt)}`;
  }

  return `${dateTimeFormatter.format(startAt)} → ${dateTimeFormatter.format(
    endAt,
  )}`;
}
