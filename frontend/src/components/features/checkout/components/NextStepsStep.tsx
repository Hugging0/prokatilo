import { StepTitle } from "./StepTitle";

const NEXT_STEPS = [
  {
    title: "Мы свяжемся с вами",
    text: "Оператор подтвердит бронь и детали доставки.",
  },
  {
    title: "Привезём вещь и оформим договор",
    text: "Курьер привезёт вещь в выбранный интервал. Для договора понадобится паспорт.",
  },
  {
    title: "Напомним о возврате",
    text: "Перед окончанием аренды оператор свяжется с вами и согласует удобное время возврата.",
  },
];

export function NextStepsStep() {
  return (
    <section>
      <StepTitle
        title="Что дальше?"
        subtitle="Коротко о следующих шагах"
      />

      <div className="mt-7 space-y-4">
        {NEXT_STEPS.map((step, index) => (
          <div
            key={step.title}
            className="flex gap-4 rounded-[1.5rem] border border-slate-100 bg-white p-5 shadow-sm"
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-900 text-sm font-black text-white">
              {index + 1}
            </span>
            <div className="pt-0.5">
              <h3 className="text-base font-black leading-snug text-slate-950">
                {step.title}
              </h3>
              <p className="mt-1 text-base font-bold leading-relaxed text-slate-600">
                {step.text}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
