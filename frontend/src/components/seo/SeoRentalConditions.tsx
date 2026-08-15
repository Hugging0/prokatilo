const RENTAL_STEPS = [
  {
    title: "Выберите вещь",
    body: "Укажите срок и оставьте заявку. Доступность на нужное время проверит оператор.",
  },
  {
    title: "Подтвердите детали",
    body: "Согласуем адрес, интервал и стоимость доставки. Для договора понадобится паспорт.",
  },
  {
    title: "Получите заказ",
    body: "Курьер привезёт вещь и поможет сверить передаваемый комплект.",
  },
  {
    title: "Верните после аренды",
    body: "Оператор заранее уточнит время, а курьер заберёт вещь и проверит комплектность.",
  },
];

export function SeoRentalConditions() {
  return (
    <section className="border-y border-slate-100 bg-white">
      <div className="mx-auto max-w-6xl px-5 py-14 lg:py-20">
        <div>
          <p className="text-sm font-black uppercase text-orange-700">Понятный процесс</p>
          <h2 className="mt-2 text-3xl font-black text-slate-950 sm:text-4xl">Как проходит аренда</h2>
        </div>

        <ol className="mt-8 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {RENTAL_STEPS.map((step, index) => (
            <li key={step.title} className="border-t border-slate-200 pt-5">
              <span className="text-sm font-black text-orange-600">0{index + 1}</span>
              <h3 className="mt-3 text-lg font-black text-slate-950">{step.title}</h3>
              <p className="mt-2 text-sm font-semibold leading-relaxed text-slate-600">{step.body}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
