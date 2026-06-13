import { Search } from "lucide-react";

import { AppBadge } from "@/components/ui/AppBadge";
import { AppEmptyState } from "@/components/ui/AppEmptyState";
import { AppNotice } from "@/components/ui/AppNotice";
import { BRAND_GRADIENT, BRAND_LOGO_CLASS } from "@/lib/brand";
import { UI_COPY } from "@/lib/copy";
import type { AppItem } from "@/types";

interface HomeViewProps {
  items: AppItem[];
  categories: string[];
  searchQuery: string;
  activeCategory: string;
  isLoading?: boolean;
  catalogError?: string | null;
  onSearchChange: (value: string) => void;
  onCategoryChange: (category: string) => void;
  onOpenDetails: (item: AppItem) => void;
}

export function HomeView({
  items,
  categories,
  searchQuery,
  activeCategory,
  isLoading = false,
  catalogError = null,
  onSearchChange,
  onCategoryChange,
  onOpenDetails,
}: HomeViewProps) {
  return (
    <main className="min-h-screen bg-slate-50 pb-[calc(8rem+env(safe-area-inset-bottom))]">
      <section
        className={`relative z-30 w-full ${BRAND_GRADIENT} rounded-b-[2rem] px-6 pt-16 pb-14 text-white shadow-lg`}
      >
        <div className="mb-6 flex flex-col items-start gap-3">
          <div className="min-w-0">
            <h1
              className={`text-4xl ${BRAND_LOGO_CLASS} leading-none`}
            >
              ПРОКАТило
            </h1>
            <p className="mt-2 text-xs font-black uppercase leading-snug tracking-[0.14em] text-white/80">
              {UI_COPY.home.slogan}
            </p>
          </div>

          <div className="inline-flex max-w-full items-center rounded-2xl border border-white/15 bg-white/20 px-3.5 py-2 text-xs font-black uppercase leading-none tracking-wide backdrop-blur-sm">
            {UI_COPY.home.serviceBadge}
          </div>
        </div>

        <div className="relative">
          <Search
            size={18}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-white/70"
          />
          <input
            value={searchQuery}
            onChange={(event) => onSearchChange(event.target.value)}
            className="w-full text-white bg-white/20 backdrop-blur-md rounded-2xl border border-white/10 focus:border-white/40 focus:outline-none pl-11 pr-4 py-3 text-sm transition-all placeholder:text-white/60 shadow-inner font-bold"
            placeholder={UI_COPY.home.searchPlaceholder}
          />
        </div>

      </section>

      <section className="relative z-40 -mt-8 px-5">
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {categories.map((category) => (
            <button
              key={category}
              type="button"
              onClick={() => onCategoryChange(category)}
              className={`whitespace-nowrap rounded-2xl px-5 py-2.5 text-xs font-black shadow-sm transition-all ${
                activeCategory === category
                  ? "bg-slate-900 text-white shadow-lg scale-105 font-black"
                  : "border border-slate-100 bg-white text-slate-500 hover:bg-slate-100"
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {isLoading && (
          <AppNotice className="mt-3 px-4 py-3 text-sm">
            {UI_COPY.home.catalogLoading}
          </AppNotice>
        )}

        {!isLoading && catalogError && (
          <AppNotice tone="danger" className="mt-3 px-4 py-3 text-sm">
            {UI_COPY.home.catalogLoadError}
          </AppNotice>
        )}

        <div className="grid gap-4 mt-4">
          {items.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => onOpenDetails(item)}
              disabled={!item.available}
              className="flex w-full items-center rounded-[1.5rem] border border-slate-100 bg-white p-4 text-left shadow-sm transition-all active:scale-[0.98] disabled:cursor-not-allowed"
            >
              {item.imageUrl ? (
                <div className="mr-4 h-16 w-16 shrink-0 overflow-hidden rounded-[1.5rem] bg-slate-100">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    className="h-full w-full object-cover"
                  />
                </div>
              ) : (
                <div
                  className={`w-16 h-16 rounded-[1.5rem] ${item.bg} ${item.color} flex items-center justify-center mr-4 shrink-0`}
                >
                  <item.icon size={30} strokeWidth={1.7} />
                </div>
              )}

              <div className="flex-1 min-w-0">
                <h2 className="text-base font-black leading-snug tracking-tight text-slate-950">
                  {item.title}
                </h2>
                <p className="mt-1 text-xs font-black uppercase tracking-widest text-slate-500">
                  {item.category}
                </p>
                <AppBadge
                  tone={item.available ? "success" : "warning"}
                  className="mt-2"
                >
                  {item.available ? "В наличии" : "Сейчас занято"}
                </AppBadge>
              </div>

              <div className="text-right">
                <p className="text-xl font-black text-slate-900 tracking-tighter leading-none">
                  {item.price3h}₽
                </p>
                <p className="mt-1 text-xs font-black uppercase text-slate-400">
                  за 3 часа
                </p>
              </div>
            </button>
          ))}

          {items.length === 0 && (
            <AppEmptyState
              title={UI_COPY.home.emptyCatalog}
              description="Попробуйте изменить запрос или выбрать другую категорию."
            />
          )}
        </div>
      </section>
    </main>
  );
}
