import { Search } from "lucide-react";

import { BRAND_GRADIENT, BRAND_LOGO_CLASS } from "@/lib/brand";
import { UI_COPY } from "@/lib/copy";
import type { AppItem } from "@/types";

interface HomeViewProps {
  items: AppItem[];
  categories: string[];
  searchQuery: string;
  activeCategory: string;
  isLoading?: boolean;
  catalogSource?: "api" | "mock";
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
  catalogSource = "mock",
  catalogError = null,
  onSearchChange,
  onCategoryChange,
  onOpenDetails,
}: HomeViewProps) {
  return (
    <main className="min-h-screen bg-slate-50 pb-28">
      <section
        className={`w-full ${BRAND_GRADIENT} rounded-b-[2.5rem] px-7 pt-16 pb-14 text-white shadow-lg relative z-30`}
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1
              className={`text-4xl ${BRAND_LOGO_CLASS} leading-none`}
            >
              ПРОКАТило
            </h1>
            <p className="text-white/90 text-[10px] font-black uppercase tracking-[0.2em] mt-2 opacity-80 leading-none">
              {UI_COPY.home.slogan}
            </p>
          </div>

          <div className="bg-white/20 p-2 rounded-xl backdrop-blur-sm border border-white/10 text-[10px] font-black uppercase">
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

      <section className="px-6 -mt-8 relative z-40">
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {categories.map((category) => (
            <button
              key={category}
              type="button"
              onClick={() => onCategoryChange(category)}
              className={`px-5 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all shadow-sm cursor-pointer ${
                activeCategory === category
                  ? "bg-slate-900 text-white shadow-lg scale-105 font-black"
                  : "bg-white text-slate-400 border border-slate-100 hover:bg-slate-100 font-bold"
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {(isLoading || (catalogSource === "mock" && catalogError)) && (
          <div className="mt-3 rounded-2xl border border-slate-100 bg-white/95 px-4 py-3 text-xs font-black text-slate-400 shadow-sm">
            {isLoading
              ? UI_COPY.home.catalogLoading
              : UI_COPY.home.catalogFallback}
          </div>
        )}

        <div className="grid gap-4 mt-4">
          {items.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => onOpenDetails(item)}
              className="bg-white p-4 shadow-sm rounded-[2rem] cursor-pointer transition-all active:scale-[0.97] border border-slate-100 flex items-center hover:shadow-md group text-left"
            >
              <div
                className={`w-16 h-16 rounded-[1.5rem] ${item.bg} ${item.color} flex items-center justify-center mr-4 shrink-0`}
              >
                <item.icon size={30} strokeWidth={1.7} />
              </div>

              <div className="flex-1 min-w-0">
                <h2 className="font-bold text-slate-800 text-base leading-tight tracking-tight">
                  {item.title}
                </h2>
                <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-tight italic mt-1">
                  {item.available ? "В наличии" : "Недоступно"}
                </p>
              </div>

              <div className="text-right">
                <p className="text-xl font-black text-slate-900 tracking-tighter leading-none">
                  {item.price3h}₽
                </p>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-tighter opacity-60 mt-1">
                  за 3 часа
                </p>
              </div>
            </button>
          ))}

          {items.length === 0 && (
            <div className="bg-white rounded-[2rem] p-8 text-center text-slate-400 font-bold">
              {UI_COPY.home.emptyCatalog}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
