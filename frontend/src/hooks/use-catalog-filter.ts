import { useMemo, useState } from "react";

import type { AppItem } from "@/types";

const ALL_ITEMS_CATEGORY = "Все вещи";

export function useCatalogFilter(items: AppItem[]) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState(ALL_ITEMS_CATEGORY);

  const filteredItems = useMemo(() => {
    const normalizedSearchQuery = searchQuery.toLowerCase();

    return items.filter((item) => {
      const matchesSearch =
        item.title.toLowerCase().includes(normalizedSearchQuery) ||
        item.desc.toLowerCase().includes(normalizedSearchQuery);

      const matchesCategory =
        activeCategory === ALL_ITEMS_CATEGORY ||
        item.category === activeCategory;

      return matchesSearch && matchesCategory;
    });
  }, [activeCategory, items, searchQuery]);

  const categories = useMemo(
    () => [
      ALL_ITEMS_CATEGORY,
      ...Array.from(new Set(items.map((item) => item.category))),
    ],
    [items],
  );

  return {
    searchQuery,
    setSearchQuery,
    activeCategory,
    setActiveCategory,
    filteredItems,
    categories,
  };
}
