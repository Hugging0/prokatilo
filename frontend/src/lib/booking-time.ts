import type { TariffType } from "@/types";

export const APP_TIME_ZONE = "Europe/Moscow";
const APP_TIME_ZONE_OFFSET = "+03:00";

const TARIFF_DURATION_MS: Record<TariffType, number> = {
  "3h": 3 * 60 * 60 * 1000,
  "6h": 6 * 60 * 60 * 1000,
  "24h": 24 * 60 * 60 * 1000,
};

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

export function getSelectedRentalInterval(
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
