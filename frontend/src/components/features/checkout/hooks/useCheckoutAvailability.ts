import { useEffect, useState } from "react";

import {
  getDateTimeFromInputs,
  getPresetEndInputValues,
  intervalsOverlap,
} from "@/lib/booking-time";
import { getDeliveryEstimateByAddress } from "@/lib/api/delivery";
import { getRentalTotalPrice, getTariffLabel } from "@/lib/tariffs";
import type { AppItem, BookingSlot, TariffType } from "@/types";

import {
  formatDeliveryDateLabel,
  formatDeliveryIntervalLabel,
  getAvailableDeliveryIntervals,
} from "../lib/delivery-intervals";
import { getDeliveryEstimate } from "../lib/delivery-zone";
import {
  mapBackendDeliveryEstimate,
  type DeliveryEstimate,
} from "../lib/delivery-zone";

export function useCheckoutAvailability({
  selectedItem,
  selectedTariff,
  selectedDate,
  selectedTime,
  bookingSlots,
  deliveryAddress,
}: {
  selectedItem: AppItem;
  selectedTariff: TariffType;
  selectedDate: string;
  selectedTime: string;
  bookingSlots: BookingSlot[];
  deliveryAddress: string;
}) {
  const [remoteDeliveryEstimate, setRemoteDeliveryEstimate] = useState<{
    address: string;
    estimate: DeliveryEstimate;
  } | null>(null);
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
  const canGoNextFromAddress = deliveryAddress.trim().length >= 5;
  const rentalDurationSummary = getTariffLabel(selectedTariff);
  const deliveryIntervalSummary = selectedStartAt
    ? `${formatDeliveryDateLabel(
        selectedStartAt,
      )}, ${formatDeliveryIntervalLabel(selectedTime)}`
    : "Выберите интервал доставки";
  const fallbackDeliveryEstimate = getDeliveryEstimate({
    address: deliveryAddress,
  });
  const trimmedDeliveryAddress = deliveryAddress.trim();
  const deliveryEstimate =
    remoteDeliveryEstimate?.address === trimmedDeliveryAddress
      ? remoteDeliveryEstimate.estimate
      : fallbackDeliveryEstimate;

  useEffect(() => {
    const trimmedAddress = deliveryAddress.trim();
    let isActive = true;

    if (trimmedAddress.length < 5) {
      return () => {
        isActive = false;
      };
    }

    const timeoutId = window.setTimeout(() => {
      void getDeliveryEstimateByAddress(trimmedAddress)
        .then((estimate) => {
          if (isActive) {
            setRemoteDeliveryEstimate({
              address: trimmedAddress,
              estimate: mapBackendDeliveryEstimate(estimate),
            });
          }
        })
        .catch(() => {
          if (isActive) {
            setRemoteDeliveryEstimate(null);
          }
        });
    }, 350);

    return () => {
      isActive = false;
      window.clearTimeout(timeoutId);
    };
  }, [deliveryAddress]);

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
    deliveryEstimate,
    availableIntervals,
    hasConflict,
    isPeriodValid,
    canGoNextFromTiming,
    canGoNextFromAddress,
    isSelectedTimeAvailable,
  };
}
