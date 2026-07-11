import { ArrowLeft, BadgeCheck, CreditCard, Truck } from "lucide-react";

import { AppBadge } from "@/components/ui/AppBadge";
import { AppButton } from "@/components/ui/AppButton";
import { AppCard } from "@/components/ui/AppCard";
import { getTariffPrice, TARIFFS } from "@/lib/tariffs";
import type { AppItem } from "@/types";

interface DetailsViewProps {
  item: AppItem;
  onBack: () => void;
  onCheckout: () => void;
}

export function DetailsView({
  item,
  onBack,
  onCheckout,
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
          <div className="flex h-[330px] w-full items-center justify-center overflow-hidden rounded-b-[2.5rem] bg-gradient-to-b from-white to-slate-100 px-8 pb-8 pt-16">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={item.imageUrl}
              alt={item.title}
              className="max-h-full max-w-full object-contain drop-shadow-[0_28px_34px_rgba(15,23,42,0.16)]"
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
        <AppCard variant="hero" className="shadow-xl shadow-slate-200/60">
          <p className="text-xs font-black uppercase tracking-widest text-slate-500">
            {item.category}
          </p>
          <h2 className="mt-3 text-3xl font-black leading-tight tracking-tight text-slate-950">
            {item.title}
          </h2>
          <p className="mt-4 text-base font-bold leading-relaxed text-slate-600">
            {item.desc}
          </p>

          <div className="mt-5 flex flex-wrap gap-2">
            <AppBadge tone="success">
              <BadgeCheck size={14} />
              Без залога
            </AppBadge>
            <AppBadge>
              <CreditCard size={14} />
              Оплата при получении
            </AppBadge>
            <AppBadge>
              <Truck size={14} />
              Привезём и заберём
            </AppBadge>
          </div>

          <div className="mt-7 grid grid-cols-3 gap-2">
            {TARIFFS.map((tariff) => (
              <div
                key={tariff.id}
                className="rounded-2xl border border-slate-100 bg-slate-50 px-3 py-3 text-left text-slate-700"
              >
                <span className="block text-xs font-black uppercase tracking-wide opacity-70">
                  {tariff.id === "24h" ? "1 день" : tariff.label}
                </span>
                <span className="mt-1 block text-lg font-black leading-none">
                  {getTariffPrice(item, tariff.id)} ₽
                </span>
              </div>
            ))}
          </div>

          <AppButton
            type="button"
            onClick={onCheckout}
            disabled={!item.available}
            fullWidth
            className="mt-7 bg-slate-900 shadow-slate-200 disabled:bg-slate-200 disabled:text-slate-400 disabled:shadow-none"
          >
            Забронировать
          </AppButton>
        </AppCard>
      </section>
    </main>
  );
}
