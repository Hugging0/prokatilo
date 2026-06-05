import {
  getRentalDurationLabel,
  getSelectedRentalInterval,
  intervalsOverlap,
} from "@/lib/booking-time";
import { getRentalTotalPrice } from "@/lib/tariffs";
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
  selectedEndDate,
  selectedEndTime,
  bookingSlots,
  clarifyAddress,
  deliveryAddress,
}: {
  selectedItem: AppItem;
  selectedTariff: TariffType;
  selectedDate: string;
  selectedTime: string;
  selectedEndDate: string;
  selectedEndTime: string;
  bookingSlots: BookingSlot[];
  clarifyAddress: boolean;
  deliveryAddress: string;
}) {
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
  const hasConflict = selectedInterval
    ? bookingSlots.some((slot) =>
        intervalsOverlap(
          selectedInterval.startAt,
          selectedInterval.endAt,
          new Date(slot.rentalStartAt),
          new Date(slot.rentalEndAt),
        ),
      )
    : false;
  const isPeriodValid = Boolean(
    selectedInterval && selectedInterval.endAt > selectedInterval.startAt,
  );
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
  const rentalDurationSummary = getRentalDurationLabel(
    selectedInterval?.startAt ?? null,
    selectedInterval?.endAt ?? null,
  );
  const deliveryIntervalSummary = selectedInterval
    ? `${formatDeliveryDateLabel(
        selectedInterval.startAt,
      )}, ${formatDeliveryIntervalLabel(selectedTime)}`
    : "Выберите интервал доставки";

  return {
    selectedInterval,
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
