import { useState } from "react";

import {
  getPresetEndInputValues,
  getTodayDateInputValue,
} from "@/lib/booking-time";
import type { AppItem, TariffType } from "@/types";

export function useCheckoutState() {
  const [selectedItem, setSelectedItem] = useState<AppItem | null>(null);
  const [selectedTariff, setSelectedTariff] = useState<TariffType>("24h");
  const [selectedDate, setSelectedDate] = useState(getTodayDateInputValue);
  const [selectedTime, setSelectedTime] = useState("12:00");
  const [selectedEndDate, setSelectedEndDate] = useState(getTodayDateInputValue);
  const [selectedEndTime, setSelectedEndTime] = useState("15:00");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [courierComment, setCourierComment] = useState("");
  const [promoCode, setPromoCode] = useState("");
  const [appliedPromoCode, setAppliedPromoCode] = useState<string | null>(null);
  const [promoDiscountPreview, setPromoDiscountPreview] = useState(0);
  const [bonusSpendAmount, setBonusSpendAmount] = useState(0);
  const [checkoutStep, setCheckoutStep] = useState(1);
  const [hasAcceptedTerms, setHasAcceptedTerms] = useState(false);

  const applyPresetEnd = (
    date: string,
    time: string,
    tariff: TariffType,
  ) => {
    const presetEnd = getPresetEndInputValues(date, time, tariff);

    if (!presetEnd) {
      return;
    }

    setSelectedEndDate(presetEnd.endDate);
    setSelectedEndTime(presetEnd.endTime);
  };

  const openDetails = (item: AppItem) => {
    setSelectedItem(item);
    setSelectedTariff("24h");
    setCheckoutStep(1);
    setHasAcceptedTerms(false);
    applyPresetEnd(selectedDate, selectedTime, "24h");
  };

  const selectTariff = (tariff: TariffType) => {
    setSelectedTariff(tariff);
    applyPresetEnd(selectedDate, selectedTime, tariff);
  };

  const resetCheckoutForm = () => {
    setDeliveryAddress("");
    setCourierComment("");
    setPromoCode("");
    setAppliedPromoCode(null);
    setPromoDiscountPreview(0);
    setBonusSpendAmount(0);
    setCheckoutStep(1);
    setHasAcceptedTerms(false);
  };

  return {
    selectedItem,
    selectedTariff,
    selectedDate,
    selectedTime,
    selectedEndDate,
    selectedEndTime,
    deliveryAddress,
    courierComment,
    promoCode,
    appliedPromoCode,
    promoDiscountPreview,
    bonusSpendAmount,
    checkoutStep,
    hasAcceptedTerms,
    setSelectedDate,
    setSelectedTime,
    setSelectedEndDate,
    setSelectedEndTime,
    setDeliveryAddress,
    setCourierComment,
    setPromoCode,
    setAppliedPromoCode,
    setPromoDiscountPreview,
    setBonusSpendAmount,
    setCheckoutStep,
    setHasAcceptedTerms,
    openDetails,
    selectTariff,
    resetCheckoutForm,
  };
}
