const CONDITION_ITEMS = [
  "Бронь подтверждает оператор после проверки вещи, адреса и времени.",
  "Для договора аренды понадобится паспорт.",
  "Курьер привозит вещь и помогает с передачей комплекта.",
  "Перед окончанием аренды оператор уточняет удобное время возврата.",
  "Доступность на конкретный срок подтверждается после заявки.",
  "Стоимость доставки зависит от адреса и маршрута.",
];

export function SeoRentalConditions() {
  return (
    <section className="border-y border-slate-100 bg-white">
      <div className="mx-auto grid max-w-6xl gap-6 px-5 py-10 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
        <div>
          <h2 className="text-2xl font-black tracking-tight text-slate-950">
            Коротко об условиях
          </h2>
          <p className="mt-3 max-w-xl text-base font-semibold leading-relaxed text-slate-600">
            Важные детали видны до перехода в приложение: без скрытых списаний
            и с подтверждением заказа оператором.
          </p>
        </div>

        <ul className="grid gap-3 sm:grid-cols-2">
          {CONDITION_ITEMS.map((item) => (
            <li
              key={item}
              className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 text-base font-bold leading-relaxed text-slate-700"
            >
              {item}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
