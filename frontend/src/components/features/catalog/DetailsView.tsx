import { ArrowLeft } from "lucide-react";

import { getTariffPrice, TARIFFS } from "@/lib/tariffs";
import type { AppItem, TariffType } from "@/types";

interface DetailsViewProps {
  item: AppItem;
  selectedTariff: TariffType;
  onBack: () => void;
  onCheckout: () => void;
  onTariffChange: (tariff: TariffType) => void;
}

export function DetailsView({
  item,
  selectedTariff,
  onBack,
  onCheckout,
  onTariffChange,
}: DetailsViewProps) {
  return (
    <main className="min-h-screen bg-slate-50 pb-28">
      <section className="relative min-h-[300px] bg-white">
        <button
          type="button"
          onClick={onBack}
          className="absolute top-12 left-6 z-20 rounded-2xl bg-white/95 p-3 shadow-lg active:scale-95"
          aria-label="Назад"
        >
          <ArrowLeft size={22} />
        </button>

        {item.imageUrl ? (
          <div className="h-[330px] w-full overflow-hidden rounded-b-[2.5rem] bg-slate-100">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={item.imageUrl}
              alt={item.title}
              className="h-full w-full object-cover"
            />
          </div>
        ) : (
          <div
            className={`flex h-[330px] w-full items-center justify-center rounded-b-[2.5rem] ${item.bg}`}
          >
            <item.icon size={92} strokeWidth={1.3} className={item.color} />
          </div>
        )}
      </section>

      <section className="relative z-10 -mt-8 px-6">
        <div className="rounded-[2rem] border border-slate-100 bg-white p-6 shadow-xl shadow-slate-200/60">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
            {item.category}
          </p>
          <h2 className="mt-3 text-3xl font-black leading-none tracking-tight text-slate-900">
            {item.title}
          </h2>
          <p className="mt-4 text-sm font-medium leading-relaxed text-slate-500">
            {item.desc}
          </p>

          <div className="mt-7 grid grid-cols-3 gap-2">
            {TARIFFS.map((tariff) => (
              <button
                key={tariff.id}
                type="button"
                onClick={() => onTariffChange(tariff.id)}
                className={`rounded-2xl border px-3 py-3 text-left transition ${
                  selectedTariff === tariff.id
                    ? "border-slate-900 bg-slate-900 text-white"
                    : "border-slate-100 bg-slate-50 text-slate-700"
                }`}
              >
                <span className="block text-[10px] font-black uppercase tracking-wide opacity-70">
                  {tariff.id === "24h" ? "1 день" : tariff.label}
                </span>
                <span className="mt-1 block text-lg font-black leading-none">
                  {getTariffPrice(item, tariff.id)} ₽
                </span>
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={onCheckout}
            disabled={!item.available}
            className="mt-7 w-full rounded-[1.5rem] bg-slate-900 px-6 py-5 text-sm font-black text-white shadow-lg shadow-slate-200 active:scale-95 disabled:bg-slate-200 disabled:text-slate-400 disabled:shadow-none"
          >
            Выбрать дату и доставку
          </button>
        </div>
      </section>
    </main>
  );
}
