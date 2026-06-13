"use client";

import { useEffect, useState } from "react";

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

  async function loadItems() {
    setIsLoading(true);

    try {
      const backendItems = await getItems();
      const appItems = mapBackendItemsToAppItems(backendItems);

      setItems(appItems);
      setError(null);
    } catch (requestError) {
      setItems([]);
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Не удалось загрузить каталог",
      );
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    let isMounted = true;

    void getItems()
      .then((backendItems) => {
        if (!isMounted) {
          return;
        }

        setItems(mapBackendItemsToAppItems(backendItems));
        setError(null);
      })
      .catch((requestError) => {
        if (!isMounted) {
          return;
        }

        setItems([]);
        setError(
          requestError instanceof Error
            ? requestError.message
            : "Не удалось загрузить каталог",
        );
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  return {
    items,
    isLoading,
    error,
    reload: loadItems,
  };
}
