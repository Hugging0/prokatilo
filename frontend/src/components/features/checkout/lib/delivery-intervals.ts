import {
  formatDateInputValue,
  getDateTimeFromInputs,
  getPresetEndInputValues,
  intervalsOverlap,
} from "@/lib/booking-time";
import type { BookingSlot, TariffType } from "@/types";

export const DELIVERY_INTERVALS = [
  "08:00",
  "10:00",
  "12:00",
  "14:00",
  "16:00",
  "18:00",
] as const;

export const DELIVERY_INTERVAL_HOURS = 2;

const checkoutDateFormatter = new Intl.DateTimeFormat("ru-RU", {
  day: "numeric",
  month: "long",
  timeZone: "Europe/Moscow",
});

export function getQuickDateOptions() {
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

export function getNextWeekdayInputValue(weekday: number) {
  const date = new Date();
  const daysAhead = (weekday - date.getDay() + 7) % 7 || 7;
  date.setDate(date.getDate() + daysAhead);
  return formatDateInputValue(date);
}

export function formatDeliveryIntervalLabel(startTime: string) {
  const [hourValue] = startTime.split(":");
  const startHour = Number(hourValue);
  const endHour = startHour + DELIVERY_INTERVAL_HOURS;
  return `${startTime}–${String(endHour).padStart(2, "0")}:00`;
}

export function formatDeliveryDateLabel(value: Date) {
  return checkoutDateFormatter.format(value);
}

export function isDeliveryIntervalAvailable({
  selectedDate,
  selectedTime,
  selectedTariff,
  bookingSlots,
}: {
  selectedDate: string;
  selectedTime: string;
  selectedTariff: TariffType;
  bookingSlots: BookingSlot[];
}) {
  const startAt = getDateTimeFromInputs(selectedDate, selectedTime);
  const presetEnd = getPresetEndInputValues(
    selectedDate,
    selectedTime,
    selectedTariff,
  );
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

export function getAvailableDeliveryIntervals({
  selectedDate,
  selectedTariff,
  bookingSlots,
}: {
  selectedDate: string;
  selectedTariff: TariffType;
  bookingSlots: BookingSlot[];
}) {
  return DELIVERY_INTERVALS.filter((selectedTime) =>
    isDeliveryIntervalAvailable({
      selectedDate,
      selectedTime,
      selectedTariff,
      bookingSlots,
    }),
  );
}
