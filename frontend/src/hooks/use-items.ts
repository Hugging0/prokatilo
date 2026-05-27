"use client";

import { useEffect, useState } from "react";

import { getAvailableItems } from "@/lib/api/items";
import { INITIAL_ITEMS } from "@/lib/mock-data";
import { mapBackendItemsToAppItems } from "@/lib/mappers/items";
import type { AppItem } from "@/types";

type CatalogSource = "api" | "mock";

interface UseItemsResult {
  items: AppItem[];
  isLoading: boolean;
  error: string | null;
  source: CatalogSource;
  reload: () => Promise<void>;
}

export function useItems(): UseItemsResult {
  const [items, setItems] = useState<AppItem[]>(INITIAL_ITEMS);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [source, setSource] = useState<CatalogSource>("mock");

  async function loadItems(
    shouldApply = () => true,
    markAsLoading = true,
  ) {
    if (markAsLoading) {
      setIsLoading(true);
    }

    try {
      const backendItems = await getAvailableItems();
      const appItems = mapBackendItemsToAppItems(backendItems);

      if (!shouldApply()) {
        return;
      }

      setItems(appItems);
      setSource("api");
      setError(null);
    } catch (requestError) {
      if (!shouldApply()) {
        return;
      }

      setItems(INITIAL_ITEMS);
      setSource("mock");
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Не удалось загрузить каталог",
      );
    } finally {
      if (shouldApply()) {
        setIsLoading(false);
      }
    }
  }

  useEffect(() => {
    let isMounted = true;

    void getAvailableItems()
      .then((backendItems) => {
        if (!isMounted) {
          return;
        }

        setItems(mapBackendItemsToAppItems(backendItems));
        setSource("api");
        setError(null);
      })
      .catch((requestError) => {
        if (!isMounted) {
          return;
        }

        setItems(INITIAL_ITEMS);
        setSource("mock");
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
    source,
    reload: () => loadItems(),
  };
}
