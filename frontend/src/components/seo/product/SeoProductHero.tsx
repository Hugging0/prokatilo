import { ArrowRight, ChevronRight, Clock3 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import type { SeoPageConfig } from "@/lib/seo/site";

const moneyFormatter = new Intl.NumberFormat("ru-RU");

const TARIFFS = [
  { key: "short", label: "3 часа" },
  { key: "day", label: "Сутки" },
  { key: "week", label: "Неделя" },
] as const;

export function SeoProductHero({ page }: { page: SeoPageConfig }) {
  const item = page.catalogItem!;
  const ctaHref = page.ctaHref ?? `/app?product=${item.slug}`;

  return (
    <>
      <section className="overflow-hidden bg-white">
        <div className="mx-auto max-w-6xl px-5 pb-14 pt-5 sm:pt-7 lg:pb-20">
          <nav aria-label="Хлебные крошки" className="hidden items-center gap-1.5 text-sm font-bold text-slate-500 sm:flex">
            {page.breadcrumbs.map((crumb, index) => (
              <span key={crumb.path} className="flex items-center gap-1.5">
                {index > 0 && <ChevronRight size={14} className="shrink-0 text-slate-300" />}
                {index === page.breadcrumbs.length - 1 ? (
                  <span className="text-slate-700">{crumb.name}</span>
                ) : (
                  <Link href={crumb.path} className="shrink-0 transition hover:text-slate-950">
                    {crumb.name}
                  </Link>
                )}
              </span>
            ))}
          </nav>

          <Link
            href={`/catalog/${item.categorySlug}`}
            className="inline-flex items-center gap-1 text-sm font-black text-slate-600 sm:hidden"
          >
            <ChevronRight size={16} className="rotate-180 text-orange-600" />
            {item.categoryTitle}
          </Link>

          <div className="mt-7 grid gap-9 lg:grid-cols-[minmax(0,1.08fr)_minmax(390px,0.92fr)] lg:items-center lg:gap-14">
            <div className="relative flex min-h-[330px] items-center justify-center overflow-hidden rounded-[2rem] bg-slate-100 px-7 py-10 sm:min-h-[480px] sm:px-14 lg:min-h-[560px]">
              <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-amber-400 via-orange-500 to-rose-600" />
              <Image
                src={item.image}
                alt={item.imageAlt}
                width={960}
                height={960}
                priority
                fetchPriority="high"
                sizes="(max-width: 1023px) calc(100vw - 2.5rem), 52vw"
                className="max-h-[290px] w-full object-contain drop-shadow-[0_30px_32px_rgba(15,23,42,0.16)] sm:max-h-[420px] lg:max-h-[500px]"
              />
            </div>

            <div>
              <Link
                href={`/catalog/${item.categorySlug}`}
                className="text-sm font-black uppercase text-orange-700 transition hover:text-rose-700"
              >
                {item.categoryTitle}
              </Link>
              <h1 className="mt-3 max-w-2xl text-4xl font-black leading-[1.08] text-slate-950 sm:text-5xl lg:text-6xl">
                {item.title}
              </h1>
              <p className="mt-5 max-w-xl text-lg font-semibold leading-relaxed text-slate-600">
                {item.description}
              </p>

              <dl className="mt-8 grid grid-cols-3 border-y border-slate-200 py-5">
                {TARIFFS.map((tariff) => (
                  <div
                    key={tariff.key}
                    className="border-r border-slate-200 px-3 first:pl-0 last:border-r-0 last:pr-0"
                  >
                    <dt className="text-xs font-black uppercase text-slate-500 sm:text-sm">
                      {tariff.label}
                    </dt>
                    <dd className="mt-1 text-lg font-black text-slate-950 sm:text-2xl">
                      {moneyFormatter.format(item.prices[tariff.key])} ₽
                    </dd>
                  </div>
                ))}
              </dl>

              <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                <Link
                  href={ctaHref}
                  className="inline-flex min-h-14 flex-1 items-center justify-center gap-2 rounded-2xl bg-gradient-to-br from-amber-400 via-orange-500 to-rose-600 px-6 text-base font-black text-white shadow-lg shadow-rose-100 transition hover:brightness-105"
                >
                  Выбрать срок
                  <ArrowRight size={19} />
                </Link>
                <Link
                  href="/delivery-area"
                  className="inline-flex min-h-14 items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 text-base font-black text-slate-700 transition hover:border-orange-200"
                >
                  Зона доставки
                </Link>
              </div>

              <p className="mt-4 flex items-start gap-2 text-sm font-bold leading-relaxed text-slate-500">
                <Clock3 size={17} className="mt-0.5 shrink-0 text-orange-600" />
                Доступность выбранного времени подтвердит оператор после заявки.
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="fixed inset-x-0 bottom-[calc(0.75rem+env(safe-area-inset-bottom))] z-50 px-3 lg:hidden">
        <Link
          href={ctaHref}
          className="mx-auto flex min-h-16 max-w-lg items-center justify-between rounded-2xl bg-slate-950 px-5 text-white shadow-2xl shadow-slate-400/50"
        >
          <span>
            <span className="block text-xs font-black uppercase text-white/60">От</span>
            <span className="text-lg font-black">
              {moneyFormatter.format(item.prices.short)} ₽ · 3 часа
            </span>
          </span>
          <span className="inline-flex items-center gap-2 text-sm font-black">
            Выбрать
            <ArrowRight size={18} />
          </span>
        </Link>
      </div>
    </>
  );
}
