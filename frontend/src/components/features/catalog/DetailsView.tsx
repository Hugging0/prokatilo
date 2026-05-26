import { ArrowLeft, Calendar as CalendarIcon, Timer } from "lucide-react";

import { getTariffPrice, TARIFFS } from "@/lib/tariffs";
import type { AppItem, TariffType } from "@/types";

interface DetailsViewProps {
  item: AppItem;
  selectedTariff: TariffType;
  selectedDate: string;
  selectedTime: string;
  onBack: () => void;
  onCheckout: () => void;
  onTariffChange: (tariff: TariffType) => void;
  onDateChange: (date: string) => void;
  onTimeChange: (time: string) => void;
}

export function DetailsView({
  item,
  selectedTariff,
  selectedDate,
  selectedTime,
  onBack,
  onCheckout,
  onTariffChange,
  onDateChange,
  onTimeChange,
}: DetailsViewProps) {
  return (
    <main className="min-h-screen bg-white pb-32">
      <section
        className={`relative ${item.bg} min-h-[330px] rounded-b-[3rem] flex items-center justify-center`}
      >
        <button
          type="button"
          onClick={onBack}
          className="absolute top-12 left-6 z-20 bg-white/90 backdrop-blur-md p-3 rounded-2xl shadow-xl active:scale-90 transition-transform"
        >
          <ArrowLeft size={22} />
        </button>

        <item.icon size={96} strokeWidth={1.3} className={item.color} />
      </section>

      <section className="px-6 -mt-10 relative z-10">
        <div className="bg-white rounded-[2.5rem] p-6 shadow-xl shadow-slate-100 border border-slate-100">
          <p className="bg-slate-100 text-slate-500 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest mb-2 inline-block italic">
            {item.category}
          </p>

          <h2 className="text-3xl font-black text-slate-900 tracking-tighter leading-none mt-4">
            {item.title}
          </h2>

          <p className="text-slate-500 font-medium mt-4 leading-relaxed">
            {item.desc}
          </p>

          <div className="mt-8">
            <h3 className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] ml-1 flex items-center gap-2 mb-3">
              <CalendarIcon size={16} />
              Дата и время
            </h3>

            <div className="grid grid-cols-2 gap-3">
              <input
                type="date"
                value={selectedDate}
                onChange={(event) => onDateChange(event.target.value)}
                className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-4 px-4 text-sm font-bold focus:ring-2 ring-rose-500 outline-none"
              />
              <input
                type="time"
                value={selectedTime}
                onChange={(event) => onTimeChange(event.target.value)}
                className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-4 px-4 text-sm font-bold focus:ring-2 ring-rose-500 outline-none"
              />
            </div>
          </div>

          <div className="mt-8">
            <h3 className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] ml-1 flex items-center gap-2 mb-3">
              <Timer size={16} />
              Длительность
            </h3>

            <div className="grid grid-cols-3 gap-3">
              {TARIFFS.map((tariff) => (
                <button
                  key={tariff.id}
                  type="button"
                  onClick={() => onTariffChange(tariff.id)}
                  className={`p-4 rounded-[1.5rem] border-2 text-center transition-all cursor-pointer ${
                    selectedTariff === tariff.id
                      ? "border-rose-500 bg-rose-50 text-rose-600 shadow-md scale-105 font-bold"
                      : "border-slate-50 bg-slate-50 opacity-70"
                  }`}
                >
                  <span
                    className={`block text-[9px] font-black uppercase tracking-tighter mb-1 ${
                      selectedTariff === tariff.id
                        ? "text-rose-400"
                        : "text-slate-400"
                    }`}
                  >
                    {tariff.label}
                  </span>
                  <span className="block text-lg font-black leading-none">
                    {getTariffPrice(item, tariff.id)}₽
                  </span>
                </button>
              ))}
            </div>
          </div>

          <button
            type="button"
            onClick={onCheckout}
            className="mt-8 w-full bg-slate-900 text-white py-6 rounded-[2rem] font-black text-lg shadow-2xl shadow-slate-300 active:scale-95 transition-transform"
          >
            Далее к оформлению
          </button>
        </div>
      </section>
    </main>
  );
}
