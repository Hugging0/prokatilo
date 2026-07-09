import type { SeoCatalogItem } from "@/lib/seo/site";

interface SeoItemDetailsProps {
  item: SeoCatalogItem;
}

const moneyFormatter = new Intl.NumberFormat("ru-RU");

const RENTAL_STEPS = [
  "Вы выбираете вещь и срок аренды.",
  "Оператор связывается с вами и подтверждает заказ.",
  "Курьер привозит вещь и помогает подписать договор.",
  "Вы пользуетесь вещью в выбранный срок.",
  "Перед окончанием аренды оператор уточняет удобное время возврата.",
  "Курьер забирает вещь и проверяет комплектность.",
];

export function SeoItemDetails({ item }: SeoItemDetailsProps) {
  return (
    <section className="bg-white">
      <div className="mx-auto max-w-6xl px-5 py-12">
        <div className="max-w-3xl">
          <h2 className="text-3xl font-black tracking-tight text-slate-950">
            Что важно знать перед бронью
          </h2>
          <p className="mt-3 text-base font-semibold leading-relaxed text-slate-600">
            Здесь собраны условия, которые помогают принять решение до перехода
            в приложение.
          </p>
        </div>

        <div className="mt-7 grid gap-5 lg:grid-cols-2">
          <article className="rounded-[1.75rem] border border-slate-100 bg-slate-50 p-6 shadow-sm">
            <h3 className="text-xl font-black tracking-tight text-slate-950">
              Тарифы
            </h3>
            <dl className="mt-5 grid gap-4 border-t border-slate-200 pt-5 sm:grid-cols-3 sm:border-t-0 sm:pt-0">
              <div>
                <dt className="text-sm font-black text-slate-500">3 часа</dt>
                <dd className="mt-1 text-2xl font-black text-slate-950">
                  {moneyFormatter.format(item.prices.short)} ₽
                </dd>
              </div>
              <div>
                <dt className="text-sm font-black text-slate-500">Сутки</dt>
                <dd className="mt-1 text-2xl font-black text-slate-950">
                  {moneyFormatter.format(item.prices.day)} ₽
                </dd>
              </div>
              <div>
                <dt className="text-sm font-black text-slate-500">Неделя</dt>
                <dd className="mt-1 text-2xl font-black text-slate-950">
                  {moneyFormatter.format(item.prices.week)} ₽
                </dd>
              </div>
            </dl>
          </article>

          <article className="rounded-[1.75rem] border border-slate-100 bg-slate-50 p-6 shadow-sm">
            <h3 className="text-xl font-black tracking-tight text-slate-950">
              Что входит в аренду
            </h3>
            <ul className="mt-5 space-y-3">
              {item.includedItems.map((includedItem) => (
                <li
                  key={includedItem}
                  className="text-base font-bold leading-relaxed text-slate-700"
                >
                  {includedItem}
                </li>
              ))}
            </ul>
          </article>

          <article className="rounded-[1.75rem] border border-slate-100 bg-white p-6 shadow-sm">
            <h3 className="text-xl font-black tracking-tight text-slate-950">
              Что понадобится для получения
            </h3>
            <p className="mt-4 text-base font-semibold leading-relaxed text-slate-600">
              Для оформления аренды понадобится паспорт. Курьер передаст вещь и
              поможет подписать договор при получении. Оператор заранее
              подтвердит детали заказа, адрес и удобное время.
            </p>
          </article>

          <article className="rounded-[1.75rem] border border-slate-100 bg-white p-6 shadow-sm">
            <h3 className="text-xl font-black tracking-tight text-slate-950">
              Важно знать
            </h3>
            <ul className="mt-5 space-y-3">
              {item.importantNotes.map((note) => (
                <li
                  key={note}
                  className="text-base font-bold leading-relaxed text-slate-700"
                >
                  {note}
                </li>
              ))}
            </ul>
          </article>
        </div>

        <article className="mt-8 border-t border-slate-100 pt-8">
          <h3 className="text-xl font-black tracking-tight text-slate-950">
            Как проходит аренда
          </h3>
          <ol className="mt-5 grid gap-x-8 gap-y-4 md:grid-cols-2">
            {RENTAL_STEPS.map((step, index) => (
              <li
                key={step}
                className="flex gap-3 text-base font-bold leading-relaxed text-slate-700"
              >
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-950 text-sm font-black text-white">
                  {index + 1}
                </span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
        </article>
      </div>
    </section>
  );
}
