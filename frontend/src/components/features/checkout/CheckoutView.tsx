import { useCallback, useEffect } from "react";

import { getPresetEndInputValues } from "@/lib/booking-time";
import type { AppItem, BookingSlot, TariffType } from "@/types";

import { AddressStep } from "./components/AddressStep";
import { CheckoutFooter } from "./components/CheckoutFooter";
import { CheckoutHeader } from "./components/CheckoutHeader";
import { NextStepsStep } from "./components/NextStepsStep";
import { ReviewStep } from "./components/ReviewStep";
import { TimingStep } from "./components/TimingStep";
import { useCheckoutAvailability } from "./hooks/useCheckoutAvailability";
import { useCheckoutStep } from "./hooks/useCheckoutStep";

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
  const availability = useCheckoutAvailability({
    selectedItem,
    selectedTariff,
    selectedDate,
    selectedTime,
    selectedEndDate,
    selectedEndTime,
    bookingSlots,
    clarifyAddress,
    deliveryAddress,
  });

  const updateStart = useCallback(
    (
      nextDate: string,
      nextTime = selectedTime,
      nextTariff = selectedTariff,
    ) => {
      onDateChange(nextDate);
      onTimeChange(nextTime);
      const presetEnd = getPresetEndInputValues(nextDate, nextTime, nextTariff);

      if (presetEnd) {
        onEndDateChange(presetEnd.endDate);
        onEndTimeChange(presetEnd.endTime);
      }
    },
    [
      onDateChange,
      onEndDateChange,
      onEndTimeChange,
      onTimeChange,
      selectedTariff,
      selectedTime,
    ],
  );

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [step]);

  useEffect(() => {
    if (
      step !== 1 ||
      isBookingsLoading ||
      bookingsError ||
      availability.availableIntervals.length === 0 ||
      availability.isSelectedTimeAvailable
    ) {
      return;
    }

    updateStart(selectedDate, availability.availableIntervals[0]);
  }, [
    availability.availableIntervals,
    availability.isSelectedTimeAvailable,
    bookingsError,
    isBookingsLoading,
    selectedDate,
    step,
    updateStart,
  ]);

  const handleTariffChange = (tariff: TariffType) => {
    onTariffChange(tariff);
    updateStart(selectedDate, selectedTime, tariff);
  };

  const goBack = () => {
    if (step === 1) {
      onBack();
      return;
    }

    setStep((current) => current - 1);
  };

  const goNext = () => {
    if (step === 4) {
      onSubmit();
      return;
    }

    setStep((current) => current + 1);
  };

  return (
    <main className="min-h-screen bg-slate-50 pb-10">
      <CheckoutHeader step={step} onBack={goBack} />

      <div className="mx-auto max-w-2xl px-6 pt-7">
        {step === 1 && (
          <TimingStep
            selectedItem={selectedItem}
            selectedTariff={selectedTariff}
            selectedDate={selectedDate}
            selectedTime={selectedTime}
            availableIntervals={availability.availableIntervals}
            isBookingsLoading={isBookingsLoading}
            bookingsError={bookingsError}
            isPeriodValid={availability.isPeriodValid}
            hasConflict={availability.hasConflict}
            onStartChange={updateStart}
            onTariffChange={handleTariffChange}
          />
        )}

        {step === 2 && (
          <AddressStep
            deliveryAddress={deliveryAddress}
            courierComment={courierComment}
            clarifyAddress={clarifyAddress}
            onDeliveryAddressChange={onDeliveryAddressChange}
            onCourierCommentChange={onCourierCommentChange}
            onClarifyAddressChange={onClarifyAddressChange}
          />
        )}

        {step === 3 && (
          <ReviewStep
            selectedItem={selectedItem}
            deliveryAddress={deliveryAddress}
            clarifyAddress={clarifyAddress}
            deliveryIntervalSummary={availability.deliveryIntervalSummary}
            rentalDurationSummary={availability.rentalDurationSummary}
            totalPrice={availability.totalPrice}
            hasSelectedInterval={Boolean(availability.selectedInterval)}
            onEditTiming={() => setStep(1)}
            onEditAddress={() => setStep(2)}
          />
        )}

        {step === 4 && <NextStepsStep />}
      </div>

      <CheckoutFooter
        step={step}
        isSubmitting={isSubmitting}
        disabled={
          isSubmitting ||
          (step === 1 &&
            (!availability.canGoNextFromTiming ||
              availability.availableIntervals.length === 0)) ||
          (step === 2 && !availability.canGoNextFromAddress)
        }
        onBack={goBack}
        onNext={goNext}
      />
    </main>
  );
}
