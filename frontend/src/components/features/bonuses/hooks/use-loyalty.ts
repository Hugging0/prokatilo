import { useCallback, useEffect, useState } from "react";

import { getLoyaltySummary } from "@/lib/api/loyalty";
import { activatePromoCode } from "@/lib/api/promo-codes";
import { UI_COPY } from "@/lib/copy";
import { mapBackendLoyaltySummaryToAppLoyaltySummary } from "@/lib/mappers/loyalty";
import type { AppLoyaltySummary } from "@/types";

interface UseLoyaltyParams {
  authToken: string;
  onNotify: (message: string) => void;
}

export function useLoyalty({ authToken, onNotify }: UseLoyaltyParams) {
  const [summary, setSummary] = useState<AppLoyaltySummary | null>(null);
  const [promoCode, setPromoCodeState] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isActivating, setIsActivating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const dto = await getLoyaltySummary(authToken);
      setSummary(mapBackendLoyaltySummaryToAppLoyaltySummary(dto));
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : UI_COPY.bonus.loadError,
      );
    } finally {
      setIsLoading(false);
    }
  }, [authToken]);

  useEffect(() => {
    const timerId = window.setTimeout(() => {
      void refresh();
    }, 0);

    return () => window.clearTimeout(timerId);
  }, [refresh]);

  const setPromoCode = (value: string) => {
    setPromoCodeState(value.toUpperCase());
  };

  const activate = async () => {
    const normalizedCode = promoCode.trim().toUpperCase();

    if (!normalizedCode) {
      onNotify("Введите промокод");
      return;
    }

    setIsActivating(true);

    try {
      const result = await activatePromoCode(authToken, { code: normalizedCode });
      onNotify(result.message || UI_COPY.toast.promoActivated);
      setPromoCodeState("");
      await refresh();
    } catch (activationError) {
      onNotify(
        activationError instanceof Error
          ? activationError.message
          : UI_COPY.toast.promoActivationError,
      );
    } finally {
      setIsActivating(false);
    }
  };

  return {
    summary,
    promoCode,
    isLoading,
    isActivating,
    error,
    setPromoCode,
    refresh,
    activatePromoCode: activate,
  };
}
