import { useCallback, useEffect, useState } from "react";

import {
  archiveAdminPromoCode,
  createAdminPromoCode,
  getAdminPromoCodes,
  updateAdminPromoCode,
} from "@/lib/api/admin-promo-codes";
import { mapBackendPromoCodeToAppPromoCode } from "@/lib/mappers/promo-codes";
import type { AdminPromoCodePayload, AppPromoCode } from "@/types";

export function useAdminPromoCodes(authToken: string) {
  const [promoCodes, setPromoCodes] = useState<AppPromoCode[]>([]);
  const [selectedPromoCode, setSelectedPromoCode] = useState<AppPromoCode | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    setMessage(null);

    try {
      const dtos = await getAdminPromoCodes(authToken);
      setPromoCodes(dtos.map(mapBackendPromoCodeToAppPromoCode));
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Не удалось загрузить промокоды",
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

  const savePromoCode = async (payload: AdminPromoCodePayload) => {
    setIsSubmitting(true);
    setMessage(null);

    try {
      if (selectedPromoCode) {
        await updateAdminPromoCode(authToken, selectedPromoCode.id, payload);
      } else {
        await createAdminPromoCode(authToken, payload);
      }

      setSelectedPromoCode(null);
      await refresh();
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Не удалось сохранить промокод",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const archivePromoCode = async (promoCodeId: number) => {
    setIsSubmitting(true);
    setMessage(null);

    try {
      await archiveAdminPromoCode(authToken, promoCodeId);
      await refresh();
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Не удалось отключить промокод",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    promoCodes,
    selectedPromoCode,
    isLoading,
    isSubmitting,
    message,
    refresh,
    savePromoCode,
    archivePromoCode,
    setSelectedPromoCode,
  };
}
