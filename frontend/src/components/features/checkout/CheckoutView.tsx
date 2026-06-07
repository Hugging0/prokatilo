import { useCallback, useEffect, useState } from "react";
import Link from "next/link";

import { getPresetEndInputValues } from "@/lib/booking-time";
import { UI_COPY } from "@/lib/copy";
import type { AppItem, BookingSlot, TariffType } from "@/types";

import { AddressStep } from "./components/AddressStep";
import { CheckoutFooter } from "./components/CheckoutFooter";
import { CheckoutHeader } from "./components/CheckoutHeader";
import { CheckoutPanel } from "./components/CheckoutPanel";
import { CheckoutLoyaltyCard } from "./components/CheckoutLoyaltyCard";
import { CheckoutPriceSummary } from "./components/CheckoutPriceSummary";
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
  deliveryAddress: string;
  courierComment: string;
  clarifyAddress: boolean;
  authToken: string;
  promoCode: string;
  appliedPromoCode: string | null;
  promoDiscountPreview: number;
  bonusSpendAmount: number;
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
  onNotify: (message: string) => void;
  onPromoCodeChange: (code: string) => void;
  onPromoApplied: (code: string | null, discountAmount: number) => void;
  onBonusSpendChange: (amount: number) => void;
  onSubmit: () => void;
}

export function CheckoutView({
  selectedItem,
  selectedTariff,
  selectedDate,
  selectedTime,
  deliveryAddress,
  courierComment,
  clarifyAddress,
  authToken,
  promoCode,
  appliedPromoCode,
  promoDiscountPreview,
  bonusSpendAmount,
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
  onNotify,
  onPromoCodeChange,
  onPromoApplied,
  onBonusSpendChange,
  onSubmit,
}: CheckoutViewProps) {
  const [step, setStep] = useCheckoutStep();
  const [hasAcceptedTerms, setHasAcceptedTerms] = useState(false);
  const availability = useCheckoutAvailability({
    selectedItem,
    selectedTariff,
    selectedDate,
    selectedTime,
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
          <div className="space-y-4">
            <ReviewStep
              selectedItem={selectedItem}
              deliveryAddress={deliveryAddress}
              clarifyAddress={clarifyAddress}
              deliveryIntervalSummary={availability.deliveryIntervalSummary}
              rentalDurationSummary={availability.rentalDurationSummary}
              hasSelectedInterval={Boolean(availability.selectedInterval)}
              onEditTiming={() => setStep(1)}
              onEditAddress={() => setStep(2)}
            />
            <CheckoutLoyaltyCard
              authToken={authToken}
              subtotalPrice={availability.totalPrice}
              promoCode={promoCode}
              promoDiscountPreview={promoDiscountPreview}
              bonusSpendAmount={bonusSpendAmount}
              onNotify={onNotify}
              onPromoCodeChange={onPromoCodeChange}
              onPromoApplied={onPromoApplied}
              onBonusSpendChange={onBonusSpendChange}
            />
            <CheckoutPriceSummary
              subtotalPrice={availability.totalPrice}
              deliveryPrice={0}
              appliedPromoCode={appliedPromoCode}
              promoDiscountPreview={promoDiscountPreview}
              bonusSpendAmount={bonusSpendAmount}
            />
          </div>
        )}

        {step === 4 && (
          <div className="space-y-4">
            <NextStepsStep />
            <CheckoutPanel>
              <label className="flex items-start gap-3">
                <input
                  type="checkbox"
                  checked={hasAcceptedTerms}
                  onChange={(event) =>
                    setHasAcceptedTerms(event.target.checked)
                  }
                  className="mt-1 size-5 rounded border-slate-300 accent-orange-500"
                />
                <span className="text-base font-bold leading-relaxed text-slate-600">
                  Нажимая «Создать бронь», я подтверждаю согласие с{" "}
                  <Link
                    href="/terms"
                    className="font-black text-orange-600 hover:text-orange-700"
                  >
                    условиями аренды
                  </Link>
                  ,{" "}
                  <Link
                    href="/delivery-payment"
                    className="font-black text-orange-600 hover:text-orange-700"
                  >
                    доставки и оплаты
                  </Link>{" "}
                  и{" "}
                  <Link
                    href="/privacy"
                    className="font-black text-orange-600 hover:text-orange-700"
                  >
                    обработки персональных данных
                  </Link>
                  .
                </span>
              </label>
              {!hasAcceptedTerms && (
                <p className="mt-3 text-sm font-bold leading-relaxed text-slate-400">
                  {UI_COPY.checkout.termsAgreement}
                </p>
              )}
            </CheckoutPanel>
          </div>
        )}
      </div>

      <CheckoutFooter
        step={step}
        isSubmitting={isSubmitting}
        disabled={
          isSubmitting ||
          (step === 1 &&
            (!availability.canGoNextFromTiming ||
              availability.availableIntervals.length === 0)) ||
          (step === 2 && !availability.canGoNextFromAddress) ||
          (step === 4 && !hasAcceptedTerms)
        }
        onBack={goBack}
        onNext={goNext}
      />
    </main>
  );
}
