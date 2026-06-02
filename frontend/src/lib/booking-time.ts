import { getTariffDurationMs } from "@/lib/tariffs";
import type { TariffType } from "@/types";

export const APP_TIME_ZONE = "Europe/Moscow";
const APP_TIME_ZONE_OFFSET = "+03:00";

const dateInputFormatter = new Intl.DateTimeFormat("en-CA", {
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  timeZone: APP_TIME_ZONE,
});

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

export function getTodayDateInputValue() {
  return dateInputFormatter.format(new Date());
}

export function formatDateInputValue(value: Date) {
  return dateInputFormatter.format(value);
}

export function formatTimeInputValue(value: Date) {
  return timeFormatter.format(value);
}

export function getDateTimeFromInputs(selectedDate: string, selectedTime: string) {
  if (!selectedDate || !selectedTime) {
    return null;
  }

  const normalizedTime =
    selectedTime.length === 5 ? `${selectedTime}:00` : selectedTime;
  const date = new Date(
    `${selectedDate}T${normalizedTime}${APP_TIME_ZONE_OFFSET}`,
  );

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date;
}

export function getSelectedRentalInterval(
  selectedStartDate: string,
  selectedStartTime: string,
  selectedEndDate: string,
  selectedEndTime: string,
) {
  const startAt = getDateTimeFromInputs(selectedStartDate, selectedStartTime);
  const endAt = getDateTimeFromInputs(selectedEndDate, selectedEndTime);

  if (!startAt || !endAt) {
    return null;
  }

  return { startAt, endAt };
}

export function getPresetEndInputValues(
  selectedStartDate: string,
  selectedStartTime: string,
  tariff: TariffType,
) {
  const startAt = getDateTimeFromInputs(selectedStartDate, selectedStartTime);

  if (!startAt) {
    return null;
  }

  const endAt = new Date(startAt.getTime() + getTariffDurationMs(tariff));

  return {
    endDate: formatDateInputValue(endAt),
    endTime: formatTimeInputValue(endAt),
  };
}

export function getDayInterval(selectedDate: string) {
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

export function intervalsOverlap(
  firstStartAt: Date,
  firstEndAt: Date,
  secondStartAt: Date,
  secondEndAt: Date,
) {
  return firstStartAt < secondEndAt && firstEndAt > secondStartAt;
}

export function formatRentalPeriod(
  startAtValue: string | Date,
  endAtValue: string | Date,
) {
  const startAt =
    startAtValue instanceof Date ? startAtValue : new Date(startAtValue);
  const endAt = endAtValue instanceof Date ? endAtValue : new Date(endAtValue);

  if (Number.isNaN(startAt.getTime()) || Number.isNaN(endAt.getTime())) {
    return "Время уточняется";
  }

  const isSameDay =
    dateFormatter.format(startAt) === dateFormatter.format(endAt);

  if (isSameDay) {
    return `${dateFormatter.format(startAt)}, ${timeFormatter.format(
      startAt,
    )}–${timeFormatter.format(endAt)}`;
  }

  return `${dateTimeFormatter.format(startAt)} → ${dateTimeFormatter.format(
    endAt,
  )}`;
}

export function isTodayInAppTimeZone(value: string | Date) {
  const date = value instanceof Date ? value : new Date(value);

  if (Number.isNaN(date.getTime())) {
    return false;
  }

  return dateInputFormatter.format(date) === getTodayDateInputValue();
}

export function getRentalDurationLabel(startAt: Date | null, endAt: Date | null) {
  if (!startAt || !endAt || endAt <= startAt) {
    return "Срок не выбран";
  }

  const durationHours = Math.ceil(
    (endAt.getTime() - startAt.getTime()) / (60 * 60 * 1000),
  );

  if (durationHours < 24) {
    return `${durationHours} ч`;
  }

  const durationDays = Math.ceil(durationHours / 24);
  return `${durationDays} дн`;
}
