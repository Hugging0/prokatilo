import type { AppOrder } from "@/types";

import { getActionsForOrder } from "../lib/order-actions";

export function OrderActions({ order }: { order: AppOrder }) {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-lg font-black tracking-tight text-slate-950">
        Что можно сделать
      </h2>
      {getActionsForOrder(order).map((action) => (
        <button
          key={action.label}
          type="button"
          disabled
          className={`flex min-h-14 w-full cursor-not-allowed items-center justify-between gap-4 rounded-2xl border px-4 text-base font-black opacity-65 shadow-sm ${
            action.tone === "danger"
              ? "border-rose-100 bg-rose-50 text-rose-700"
              : "border-slate-100 bg-white text-slate-800"
          }`}
        >
          <span className="flex items-center gap-3">
            <action.icon size={20} />
            {action.label}
          </span>
          <span className="text-xs font-black text-slate-400">Скоро</span>
        </button>
      ))}
    </section>
  );
}
