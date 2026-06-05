import { StepTitle } from "./StepTitle";

const NEXT_STEPS = [
  "Оператор проверит наличие, подтвердит бронь и позвонит вам.",
  "Курьер привезёт вещь в выбранный интервал.",
  "Курьер подпишет с вами договор аренды. Для оформления понадобятся паспортные данные.",
  "Оплата будет при получении товара курьеру. Сейчас деньги не списываются.",
];

export function NextStepsStep() {
  return (
    <section>
      <StepTitle
        title="Что будет дальше?"
        subtitle="Оператор подтвердит детали и подготовит доставку"
      />

      <div className="mt-7 space-y-4">
        {NEXT_STEPS.map((text, index) => (
          <div
            key={text}
            className="flex gap-4 rounded-[1.5rem] border border-slate-100 bg-white p-5 shadow-sm"
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-900 text-sm font-black text-white">
              {index + 1}
            </span>
            <p className="pt-1 text-base font-bold leading-relaxed text-slate-700">
              {text}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
