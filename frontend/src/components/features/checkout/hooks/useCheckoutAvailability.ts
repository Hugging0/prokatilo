import {
  getDateTimeFromInputs,
  getPresetEndInputValues,
  intervalsOverlap,
} from "@/lib/booking-time";
import { getRentalTotalPrice, getTariffLabel } from "@/lib/tariffs";
import type { AppItem, BookingSlot, TariffType } from "@/types";

import {
  formatDeliveryDateLabel,
  formatDeliveryIntervalLabel,
  getAvailableDeliveryIntervals,
} from "../lib/delivery-intervals";

export function useCheckoutAvailability({
  selectedItem,
  selectedTariff,
  selectedDate,
  selectedTime,
  bookingSlots,
  clarifyAddress,
  deliveryAddress,
}: {
  selectedItem: AppItem;
  selectedTariff: TariffType;
  selectedDate: string;
  selectedTime: string;
  bookingSlots: BookingSlot[];
  clarifyAddress: boolean;
  deliveryAddress: string;
}) {
  const selectedStartAt = getDateTimeFromInputs(selectedDate, selectedTime);
  const selectedPresetEnd = getPresetEndInputValues(
    selectedDate,
    selectedTime,
    selectedTariff,
  );
  const selectedEndAt = selectedPresetEnd
    ? getDateTimeFromInputs(selectedPresetEnd.endDate, selectedPresetEnd.endTime)
    : null;
  const totalPrice = getRentalTotalPrice(
    selectedItem,
    selectedTariff,
    null,
    null,
  );
  const hasConflict = selectedStartAt && selectedEndAt
    ? bookingSlots.some((slot) =>
        intervalsOverlap(
          selectedStartAt,
          selectedEndAt,
          new Date(slot.rentalStartAt),
          new Date(slot.rentalEndAt),
        ),
      )
    : false;
  const isPeriodValid = Boolean(selectedStartAt && selectedEndAt);
  const availableIntervals = getAvailableDeliveryIntervals({
    selectedDate,
    selectedTariff,
    bookingSlots,
  });
  const isSelectedTimeAvailable = availableIntervals.includes(
    selectedTime as (typeof availableIntervals)[number],
  );
  const canGoNextFromTiming =
    selectedItem.available && isPeriodValid && !hasConflict;
  const canGoNextFromAddress =
    clarifyAddress || deliveryAddress.trim().length >= 5;
  const rentalDurationSummary = getTariffLabel(selectedTariff);
  const deliveryIntervalSummary = selectedStartAt
    ? `${formatDeliveryDateLabel(
        selectedStartAt,
      )}, ${formatDeliveryIntervalLabel(selectedTime)}`
    : "Выберите интервал доставки";

  return {
    selectedInterval: selectedStartAt
      ? {
          startAt: selectedStartAt,
          endAt: selectedEndAt,
        }
      : null,
    totalPrice,
    rentalDurationSummary,
    deliveryIntervalSummary,
    availableIntervals,
    hasConflict,
    isPeriodValid,
    canGoNextFromTiming,
    canGoNextFromAddress,
    isSelectedTimeAvailable,
  };
}
