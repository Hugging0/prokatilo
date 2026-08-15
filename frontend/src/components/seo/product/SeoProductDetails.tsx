import { AlertTriangle, Check, PackageCheck } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { SEO_CATALOG_ITEMS } from "@/lib/seo/content";
import type { SeoCatalogItem, SeoPageConfig } from "@/lib/seo/site";

const moneyFormatter = new Intl.NumberFormat("ru-RU");

const RENTAL_STEPS = [
  {
    title: "Оставьте заявку",
    body: "Выберите вещь и срок в приложении. Оператор проверит доступность на нужное время.",
  },
  {
    title: "Подтвердите детали",
    body: "Согласуем адрес, интервал и стоимость доставки. Для договора понадобится паспорт.",
  },
  {
    title: "Получите вещь",
    body: "Курьер привезёт комплект, поможет сверить его и подписать договор.",
  },
  {
    title: "Верните после аренды",
    body: "Оператор заранее уточнит удобное время, а курьер заберёт и проверит комплект.",
  },
];

function ProductList({ items }: { items: string[] }) {
  return (
    <ul className="mt-6 space-y-4">
      {items.map((item) => (
        <li key={item} className="flex gap-3 text-base font-bold leading-relaxed text-slate-700">
          <Check size={19} className="mt-0.5 shrink-0 text-orange-600" strokeWidth={3} />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

function RelatedProducts({ item }: { item: SeoCatalogItem }) {
  const sameCategory = SEO_CATALOG_ITEMS.filter(
    (candidate) => candidate.slug !== item.slug && candidate.categorySlug === item.categorySlug,
  );
  const fallback = SEO_CATALOG_ITEMS.filter(
    (candidate) => candidate.slug !== item.slug && candidate.categorySlug !== item.categorySlug,
  );
  const related = [...sameCategory, ...fallback].slice(0, 3);

  return (
    <section className="bg-slate-50">
      <div className="mx-auto max-w-6xl px-5 py-14 lg:py-20">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-sm font-black uppercase text-orange-700">Каталог</p>
            <h2 className="mt-2 text-3xl font-black text-slate-950 sm:text-4xl">Ещё можно арендовать</h2>
          </div>
          <Link href="/catalog" className="hidden text-sm font-black text-slate-600 hover:text-slate-950 sm:block">
            Весь каталог
          </Link>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          {related.map((relatedItem) => (
            <Link
              key={relatedItem.slug}
              href={`/rent/${relatedItem.slug}`}
              className="group grid grid-cols-[96px_1fr] items-center gap-4 rounded-[1.5rem] border border-slate-100 bg-white p-4 shadow-sm transition hover:border-orange-200 sm:grid-cols-1"
            >
              <div className="flex aspect-square items-center justify-center rounded-2xl bg-slate-100 p-3 sm:w-full">
                <Image
                  src={relatedItem.image}
                  alt={relatedItem.imageAlt}
                  width={320}
                  height={320}
                  sizes="(max-width: 639px) 96px, 30vw"
                  className="h-full w-full object-contain transition duration-300 group-hover:scale-105"
                />
              </div>
              <div>
                <h3 className="text-base font-black leading-snug text-slate-950 sm:text-lg">{relatedItem.title}</h3>
                <p className="mt-2 text-sm font-bold text-slate-500">
                  от {moneyFormatter.format(relatedItem.prices.short)} ₽ · 3 часа
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

export function SeoProductDetails({ page }: { page: SeoPageConfig }) {
  const item = page.catalogItem!;
  const utilityLinks = page.relatedLinks?.filter(
    (link) => link.path !== `/catalog/${item.categorySlug}`,
  );

  return (
    <>
      <section className="border-y border-slate-100 bg-slate-50">
        <div className="mx-auto grid max-w-6xl gap-8 px-5 py-14 lg:grid-cols-[0.72fr_1.28fr] lg:items-start lg:py-20">
          <div>
            <p className="text-sm font-black uppercase text-orange-700">Подходящие сценарии</p>
            <h2 className="mt-2 text-3xl font-black text-slate-950 sm:text-4xl">Когда пригодится</h2>
          </div>
          <ul className="grid gap-px overflow-hidden rounded-[1.5rem] border border-slate-200 bg-slate-200 sm:grid-cols-3">
            {item.bestFor.map((useCase) => (
              <li key={useCase} className="flex min-h-28 items-start gap-3 bg-white p-5 text-base font-black leading-snug text-slate-800">
                <Check size={20} className="shrink-0 text-orange-600" strokeWidth={3} />
                {useCase}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="bg-white">
        <div className="mx-auto grid max-w-6xl gap-12 px-5 py-14 lg:grid-cols-2 lg:gap-0 lg:py-20">
          <article className="lg:border-r lg:border-slate-200 lg:pr-14">
            <PackageCheck size={28} className="text-orange-600" />
            <h2 className="mt-4 text-3xl font-black text-slate-950">Что входит</h2>
            <ProductList items={item.includedItems} />
          </article>

          <article className="lg:pl-14">
            <AlertTriangle size={28} className="text-rose-600" />
            <h2 className="mt-4 text-3xl font-black text-slate-950">Перед использованием</h2>
            <ProductList items={item.importantNotes} />
          </article>
        </div>
      </section>

      <section className="bg-slate-950 text-white">
        <div className="mx-auto max-w-6xl px-5 py-14 lg:py-20">
          <p className="text-sm font-black uppercase text-orange-400">От заявки до возврата</p>
          <h2 className="mt-2 max-w-2xl text-3xl font-black sm:text-4xl">Как проходит аренда</h2>
          <ol className="mt-9 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {RENTAL_STEPS.map((step, index) => (
              <li key={step.title} className="border-t border-white/20 pt-5">
                <span className="text-sm font-black text-orange-400">0{index + 1}</span>
                <h3 className="mt-3 text-xl font-black">{step.title}</h3>
                <p className="mt-2 text-base font-semibold leading-relaxed text-slate-300">{step.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {page.faqs && (
        <section className="bg-white">
          <div className="mx-auto grid max-w-6xl gap-8 px-5 py-14 lg:grid-cols-[0.72fr_1.28fr] lg:py-20">
            <div>
              <p className="text-sm font-black uppercase text-orange-700">Без лишних догадок</p>
              <h2 className="mt-2 text-3xl font-black text-slate-950 sm:text-4xl">Частые вопросы</h2>
            </div>
            <div className="border-t border-slate-200">
              {page.faqs.map((faq) => (
                <details key={faq.question} className="group border-b border-slate-200 py-5">
                  <summary className="cursor-pointer list-none pr-8 text-lg font-black text-slate-950 marker:hidden">
                    <span className="flex items-start justify-between gap-4">
                      {faq.question}
                      <span className="text-2xl font-semibold leading-none text-orange-600 group-open:rotate-45">+</span>
                    </span>
                  </summary>
                  <p className="max-w-2xl pt-3 text-base font-semibold leading-relaxed text-slate-600">{faq.answer}</p>
                </details>
              ))}
            </div>
          </div>
        </section>
      )}

      {utilityLinks && utilityLinks.length > 0 && (
        <nav aria-label="Полезные ссылки" className="border-t border-slate-100 bg-white">
          <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-6 gap-y-3 px-5 py-7 text-sm font-black text-slate-600">
            <span className="text-slate-950">Перед арендой:</span>
            {utilityLinks.map((link) => (
              <Link key={link.path} href={link.path} className="transition hover:text-orange-700">
                {link.name}
              </Link>
            ))}
          </div>
        </nav>
      )}

      <RelatedProducts item={item} />
    </>
  );
}
