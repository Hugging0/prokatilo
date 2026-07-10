import { useCallback, useEffect, useState } from "react";

import { getPublicServiceSettings } from "@/lib/api/service-settings";
import { DEFAULT_PUBLIC_SERVICE_SETTINGS } from "@/lib/service-settings";
import type { PublicServiceSettingsDto } from "@/types";

export function useServiceSettings() {
  const [settings, setSettings] = useState<PublicServiceSettingsDto>(
    DEFAULT_PUBLIC_SERVICE_SETTINGS,
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      setSettings(await getPublicServiceSettings());
    } catch (caughtError) {
      setSettings(DEFAULT_PUBLIC_SERVICE_SETTINGS);
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Не удалось загрузить настройки сервиса",
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let isActive = true;

    void getPublicServiceSettings()
      .then((loadedSettings) => {
        if (!isActive) return;
        setSettings(loadedSettings);
        setError(null);
      })
      .catch((caughtError) => {
        if (!isActive) return;
        setSettings(DEFAULT_PUBLIC_SERVICE_SETTINGS);
        setError(
          caughtError instanceof Error
            ? caughtError.message
            : "Не удалось загрузить настройки сервиса",
        );
      })
      .finally(() => {
        if (isActive) {
          setIsLoading(false);
        }
      });

    return () => {
      isActive = false;
    };
  }, []);

  return {
    settings,
    isLoading,
    error,
    reload,
  };
}
