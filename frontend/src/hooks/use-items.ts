"use client";

import { useCallback, useEffect, useState } from "react";

import { useAutoRefresh } from "@/hooks/use-auto-refresh";
import { getItems } from "@/lib/api/items";
import { mapBackendItemsToAppItems } from "@/lib/mappers/items";
import type { AppItem } from "@/types";

interface UseItemsResult {
  items: AppItem[];
  isLoading: boolean;
  error: string | null;
  reload: () => Promise<void>;
}

export function useItems(): UseItemsResult {
  const [items, setItems] = useState<AppItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadItems = useCallback(
    async ({
      showLoading = true,
      clearOnError = false,
    }: {
      showLoading?: boolean;
      clearOnError?: boolean;
    } = {}) => {
      if (showLoading) {
        setIsLoading(true);
      }

      try {
        const backendItems = await getItems();
        const appItems = mapBackendItemsToAppItems(backendItems);

        setItems(appItems);
        setError(null);
      } catch (requestError) {
        if (clearOnError) {
          setItems([]);
        }

        setError(
          requestError instanceof Error
            ? requestError.message
            : "Не удалось загрузить каталог",
        );
      } finally {
        if (showLoading) {
          setIsLoading(false);
        }
      }
    },
    [],
  );

  useEffect(() => {
    void Promise.resolve().then(() => loadItems({ clearOnError: true }));
  }, [loadItems]);

  useAutoRefresh({
    intervalMs: 5 * 60 * 1_000,
    onRefresh: () => loadItems({ showLoading: false }),
  });

  return {
    items,
    isLoading,
    error,
    reload: () => loadItems(),
  };
}
