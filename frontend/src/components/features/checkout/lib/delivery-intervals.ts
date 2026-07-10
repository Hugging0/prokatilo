import {
  formatDateInputValue,
  getDateTimeFromInputs,
  getPresetEndInputValues,
  intervalsOverlap,
} from "@/lib/booking-time";
import { DEFAULT_PUBLIC_SERVICE_SETTINGS } from "@/lib/service-settings";
import type { BookingSlot, PublicServiceSettingsDto, TariffType } from "@/types";

const checkoutDateFormatter = new Intl.DateTimeFormat("ru-RU", {
  day: "numeric",
  month: "long",
  timeZone: "Europe/Moscow",
});

function parseTimeToMinutes(value: string) {
  const [hoursValue, minutesValue] = value.split(":");
  const hours = Number(hoursValue);
  const minutes = Number(minutesValue);

  if (
    !Number.isInteger(hours) ||
    !Number.isInteger(minutes) ||
    hours < 0 ||
    hours > 23 ||
    minutes < 0 ||
    minutes > 59
  ) {
    return null;
  }

  return hours * 60 + minutes;
}

function formatMinutesAsTime(totalMinutes: number) {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

function getSafeServiceSettings(settings?: PublicServiceSettingsDto) {
  return settings ?? DEFAULT_PUBLIC_SERVICE_SETTINGS;
}

export function getQuickDateOptions() {
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  const options = [
    { label: "Сегодня", value: formatDateInputValue(today) },
    { label: "Завтра", value: formatDateInputValue(tomorrow) },
    { label: "Сб", value: getNextWeekdayInputValue(6) },
    { label: "Вс", value: getNextWeekdayInputValue(0) },
  ];

  return options.filter(
    (option, index, allOptions) =>
      allOptions.findIndex((item) => item.value === option.value) === index,
  );
}

export function getNextWeekdayInputValue(weekday: number) {
  const date = new Date();
  const daysAhead = (weekday - date.getDay() + 7) % 7 || 7;
  date.setDate(date.getDate() + daysAhead);
  return formatDateInputValue(date);
}

export function getDeliveryIntervals(settings?: PublicServiceSettingsDto) {
  const safeSettings = getSafeServiceSettings(settings);
  const workdayStart = parseTimeToMinutes(safeSettings.workday_start);
  const workdayEnd = parseTimeToMinutes(safeSettings.workday_end);
  const slotMinutes = safeSettings.delivery_slot_minutes;

  if (
    workdayStart === null ||
    workdayEnd === null ||
    workdayStart >= workdayEnd ||
    slotMinutes < 15
  ) {
    return getDeliveryIntervals(DEFAULT_PUBLIC_SERVICE_SETTINGS);
  }

  const intervals: string[] = [];

  for (
    let current = workdayStart;
    current + slotMinutes <= workdayEnd;
    current += slotMinutes
  ) {
    intervals.push(formatMinutesAsTime(current));
  }

  return intervals;
}

export function formatDeliveryIntervalLabel(
  startTime: string,
  settings?: PublicServiceSettingsDto,
) {
  const safeSettings = getSafeServiceSettings(settings);
  const startMinutes = parseTimeToMinutes(startTime);

  if (startMinutes === null) {
    return startTime;
  }

  const endTime = formatMinutesAsTime(
    startMinutes + safeSettings.delivery_slot_minutes,
  );
  return `${startTime}–${endTime}`;
}

export function formatDeliveryDateLabel(value: Date) {
  return checkoutDateFormatter.format(value);
}

export function isDeliveryIntervalAvailable({
  selectedDate,
  selectedTime,
  selectedTariff,
  bookingSlots,
  settings,
}: {
  selectedDate: string;
  selectedTime: string;
  selectedTariff: TariffType;
  bookingSlots: BookingSlot[];
  settings?: PublicServiceSettingsDto;
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

  const safeSettings = getSafeServiceSettings(settings);
  const minStartAt = new Date(
    Date.now() + safeSettings.min_order_lead_minutes * 60 * 1000,
  );

  if (startAt < minStartAt) {
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
  settings,
}: {
  selectedDate: string;
  selectedTariff: TariffType;
  bookingSlots: BookingSlot[];
  settings?: PublicServiceSettingsDto;
}) {
  return getDeliveryIntervals(settings).filter((selectedTime) =>
    isDeliveryIntervalAvailable({
      selectedDate,
      selectedTime,
      selectedTariff,
      bookingSlots,
      settings,
    }),
  );
}
