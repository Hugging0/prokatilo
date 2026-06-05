import { ArrowLeft } from "lucide-react";

export function OrderDetailsHeader({
  orderId,
  onBack,
}: {
  orderId: number;
  onBack: () => void;
}) {
  return (
    <header className="flex items-center gap-4">
      <button
        type="button"
        onClick={onBack}
        className="flex size-12 shrink-0 items-center justify-center rounded-2xl border border-slate-100 bg-white text-slate-800 shadow-sm active:scale-95"
        aria-label="Назад к списку броней"
      >
        <ArrowLeft size={21} />
      </button>
      <div>
        <p className="text-sm font-extrabold uppercase tracking-[0.14em] text-slate-400">
          ПРОКАТИЛО
        </p>
        <h1 className="mt-1 text-3xl font-black leading-tight tracking-tight text-slate-950">
          Бронь №{orderId}
        </h1>
      </div>
    </header>
  );
}
