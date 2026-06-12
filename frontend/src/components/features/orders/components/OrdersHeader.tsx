import { RefreshCw } from "lucide-react";

import { UI_COPY } from "@/lib/copy";

export function OrdersHeader({ onRefresh }: { onRefresh: () => void }) {
  return (
    <header className="flex items-center justify-between gap-4">
      <div>
        <p className="text-sm font-extrabold uppercase tracking-[0.14em] text-slate-400">
          ПРОКАТИЛО
        </p>
        <h1 className="mt-2 text-3xl font-black leading-tight tracking-tight text-slate-950">
          {UI_COPY.orders.title}
        </h1>
      </div>
      <button
        type="button"
        onClick={onRefresh}
        className="flex size-12 items-center justify-center rounded-2xl border border-slate-100 bg-white text-slate-600 shadow-sm active:scale-95"
        aria-label="Обновить брони"
      >
        <RefreshCw size={20} />
      </button>
    </header>
  );
}
