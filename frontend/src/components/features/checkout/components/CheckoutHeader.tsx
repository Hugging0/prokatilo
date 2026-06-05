import { ArrowLeft } from "lucide-react";

export function CheckoutHeader({
  step,
  onBack,
}: {
  step: number;
  onBack: () => void;
}) {
  return (
    <header className="sticky top-0 z-30 border-b border-slate-100 bg-slate-50/95 px-6 py-4 backdrop-blur">
      <div className="mx-auto flex max-w-2xl items-center justify-between gap-4">
        <button
          type="button"
          onClick={onBack}
          className="rounded-2xl bg-white p-3 text-slate-900 shadow-sm active:scale-95"
          aria-label="Назад"
        >
          <ArrowLeft size={21} />
        </button>
        <div className="text-center">
          <p className="text-sm font-black tracking-[0.18em] text-slate-900">
            ПРОКАТИЛО
          </p>
          <p className="mt-1 text-sm font-bold text-slate-400">{step} из 4</p>
        </div>
        <div className="h-11 w-11" />
      </div>
    </header>
  );
}
