import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";

import { JsonLdScript } from "@/components/seo/JsonLdScript";
import { CatalogOrbit } from "@/components/seo/catalog/CatalogOrbit";
import {
  BUSINESS_ADDRESS,
  BUSINESS_PHONE_DISPLAY,
  BUSINESS_PHONE_HREF,
} from "@/lib/business";
import { SEO_BLOG_POSTS, SEO_CATALOG_ITEMS } from "@/lib/seo/content";
import { buildJsonLd } from "@/lib/seo/jsonld";
import type { SeoPageConfig } from "@/lib/seo/site";

interface SeoPageProps {
  page: SeoPageConfig;
}

const CATALOG_ORBIT_ITEM_IDS = [3, 4, 6, 5] as const;

function SeoLink({
  href,
  children,
  variant = "secondary",
}: {
  href: string;
  children: ReactNode;
  variant?: "primary" | "secondary";
}) {
  const className =
    variant === "primary"
      ? "inline-flex min-h-12 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 via-orange-500 to-rose-600 px-5 text-base font-black text-white shadow-lg shadow-rose-100 transition hover:brightness-105"
      : "inline-flex min-h-12 items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 text-base font-black text-slate-700 shadow-sm transition hover:border-orange-200";

  return (
    <Link href={href} className={className}>
      {children}
    </Link>
  );
}

function ProductGrid() {
  return (
    <section className="border-y border-slate-100 bg-white">
      <div className="mx-auto grid max-w-6xl gap-5 px-5 py-12 md:grid-cols-2 lg:grid-cols-4">
        {SEO_CATALOG_ITEMS.map((item) => (
          <Link
            key={item.slug}
            href={`/rent/${item.slug}`}
            className="group overflow-hidden rounded-[1.5rem] border border-slate-100 bg-slate-50 shadow-sm transition hover:-translate-y-1 hover:border-orange-200 hover:shadow-lg"
          >
            <div className="aspect-square bg-white">
              <Image
                src={item.image}
                alt={item.imageAlt}
                width={512}
                height={512}
                sizes="(max-width: 767px) calc(100vw - 2.5rem), (max-width: 1023px) calc(50vw - 2rem), 25vw"
                className="h-full w-full object-cover"
              />
            </div>
            <div className="space-y-3 p-5">
              <p className="text-xs font-black uppercase tracking-wide text-orange-700">
                {item.categoryTitle}
              </p>
              <h2 className="text-xl font-black tracking-tight text-slate-950">
                {item.shortTitle}
              </h2>
              <p className="text-base font-semibold leading-relaxed text-slate-600">
                {item.description}
              </p>
              <span className="inline-flex rounded-full bg-white px-3 py-1 text-sm font-black text-slate-700 shadow-sm">
                {item.fromPrice}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

function BlogLinks() {
  return (
    <section className="bg-slate-50">
      <div className="mx-auto max-w-6xl px-5 py-12">
        <div className="mb-6 flex flex-col gap-2">
          <p className="text-sm font-black uppercase tracking-wide text-orange-700">
            Блог
          </p>
          <h2 className="text-3xl font-black tracking-tight text-slate-950">
            Идеи для редких задач
          </h2>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {SEO_BLOG_POSTS.map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="rounded-[1.5rem] border border-slate-100 bg-white p-5 shadow-sm transition hover:border-orange-200"
            >
              <h3 className="text-xl font-black tracking-tight text-slate-950">
                {post.h1}
              </h3>
              <p className="mt-2 text-base font-semibold leading-relaxed text-slate-600">
                {post.description}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

export function SeoPage({ page }: SeoPageProps) {
  const jsonLd = buildJsonLd(page);
  const isHome = page.path === "/";
  const isCatalog = page.path === "/catalog";
  const isBlog = page.path === "/blog";
  const catalogOrbitItems = CATALOG_ORBIT_ITEM_IDS.flatMap((itemId) => {
    const item = SEO_CATALOG_ITEMS.find((candidate) => candidate.appItemId === itemId);
    if (!item) return [];

    return [{
      appItemId: item.appItemId,
      title: item.orbitTitle,
      description: item.orbitDescription,
      image: item.image,
      imageAlt: item.imageAlt,
      prices: item.prices,
    }];
  });

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <JsonLdScript entities={jsonLd} />

      <header className={`relative z-50 border-b border-slate-100 bg-white ${isCatalog ? "h-[68px] sm:h-[78px]" : ""}`}>
        <div className={`mx-auto flex h-full items-center justify-between gap-4 px-5 ${isCatalog ? "max-w-none sm:px-8 lg:px-[52px]" : "max-w-6xl py-4"}`}>
          <Link
            href="/"
            aria-label={isCatalog ? "ПРОКАТило — главная" : undefined}
            className={`inline-flex items-center font-black text-slate-950 ${isCatalog ? "gap-3 text-xl" : "text-xl italic tracking-tighter"}`}
          >
            {isCatalog && (
              <Image
                src="/icons/prokatilo-icon-192.png"
                alt=""
                width={44}
                height={44}
                priority
                className="rounded-xl shadow-lg shadow-rose-100"
              />
            )}
            <span className={isCatalog ? "hidden sm:inline" : ""}>ПРОКАТило</span>
          </Link>
          <nav className="hidden items-center gap-5 text-sm font-black text-slate-600 sm:flex">
            <Link href="/catalog">Каталог</Link>
            <Link href="/delivery-area">Доставка</Link>
            <Link href="/faq">FAQ</Link>
          </nav>
          <Link
            href="/app"
            className={isCatalog
              ? "inline-flex min-h-11 items-center whitespace-nowrap rounded-2xl bg-gradient-to-br from-amber-400 via-orange-500 to-rose-600 px-4 text-sm font-black text-white shadow-lg shadow-rose-100 transition hover:-translate-y-0.5 sm:min-h-12 sm:px-5"
              : "rounded-2xl bg-slate-950 px-4 py-2 text-sm font-black text-white"}
          >
            {isCatalog ? "Открыть приложение" : "В приложение"}
          </Link>
        </div>
      </header>

      {isCatalog ? (
        <CatalogOrbit
          heading={page.h1}
          intro={page.intro}
          items={catalogOrbitItems}
        />
      ) : (
      <section className="bg-white">
        <div className="mx-auto grid max-w-6xl gap-8 px-5 py-14 md:grid-cols-[1.05fr_0.95fr] md:items-center">
          <div>
            {page.breadcrumbs.length > 1 && (
              <nav
                aria-label="Хлебные крошки"
                className="mb-5 flex flex-wrap gap-2 text-sm font-bold text-slate-500"
              >
                {page.breadcrumbs.map((item, index) => (
                  <span key={item.path} className="flex items-center gap-2">
                    {index > 0 && <span>/</span>}
                    <Link href={item.path}>{item.name}</Link>
                  </span>
                ))}
              </nav>
            )}
            {page.eyebrow && (
              <p className="mb-3 text-sm font-black uppercase tracking-wide text-orange-700">
                {page.eyebrow}
              </p>
            )}
            <h1 className="max-w-3xl text-4xl font-black tracking-tight text-slate-950 sm:text-5xl">
              {page.h1}
            </h1>
            <p className="mt-5 max-w-2xl text-lg font-semibold leading-relaxed text-slate-600">
              {page.intro}
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              {page.ctaLabel && page.ctaHref && (
                <SeoLink href={page.ctaHref} variant="primary">
                  {page.ctaLabel}
                </SeoLink>
              )}
              {page.secondaryCtaLabel && page.secondaryCtaHref && (
                <SeoLink href={page.secondaryCtaHref}>
                  {page.secondaryCtaLabel}
                </SeoLink>
              )}
            </div>
          </div>

          <div className="overflow-hidden rounded-[1.75rem] border border-slate-100 bg-slate-50 shadow-sm">
            <Image
              src={page.image ?? "/icons/prokatilo-icon-512.png"}
              alt={page.imageAlt ?? page.h1}
              width={512}
              height={512}
              priority
              fetchPriority="high"
              sizes="(max-width: 767px) calc(100vw - 2.5rem), 45vw"
              className="h-full min-h-72 w-full object-cover"
            />
          </div>
        </div>
      </section>
      )}

      <section className="mx-auto grid max-w-6xl gap-5 px-5 py-12 md:grid-cols-2">
        {page.sections.map((section) => (
          <article
            key={section.title}
            className="rounded-[1.5rem] border border-slate-100 bg-white p-6 shadow-sm"
          >
            <h2 className="text-2xl font-black tracking-tight text-slate-950">
              {section.title}
            </h2>
            <p className="mt-3 text-base font-semibold leading-relaxed text-slate-600">
              {section.body}
            </p>
            {section.items && (
              <ul className="mt-5 space-y-2">
                {section.items.map((item) => (
                  <li
                    key={item}
                    className="rounded-2xl bg-slate-50 px-4 py-3 text-base font-bold text-slate-700"
                  >
                    {item}
                  </li>
                ))}
              </ul>
            )}
          </article>
        ))}
      </section>

      {page.faqs && (
        <section className="border-y border-slate-100 bg-white">
          <div className="mx-auto max-w-4xl px-5 py-12">
            <h2 className="text-3xl font-black tracking-tight text-slate-950">
              Частые вопросы
            </h2>
            <div className="mt-6 grid gap-4">
              {page.faqs.map((faq) => (
                <article
                  key={faq.question}
                  className="rounded-[1.5rem] border border-slate-100 bg-slate-50 p-5"
                >
                  <h3 className="text-lg font-black text-slate-950">
                    {faq.question}
                  </h3>
                  <p className="mt-2 text-base font-semibold leading-relaxed text-slate-600">
                    {faq.answer}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      {isHome && <ProductGrid />}
      {(isHome || isBlog) && <BlogLinks />}

      {page.relatedLinks && (
        <section className="mx-auto max-w-6xl px-5 py-12">
          <h2 className="text-2xl font-black tracking-tight text-slate-950">
            Полезные ссылки
          </h2>
          <div className="mt-5 flex flex-wrap gap-3">
            {page.relatedLinks.map((link) => (
              <SeoLink key={link.path} href={link.path}>
                {link.name}
              </SeoLink>
            ))}
          </div>
        </section>
      )}

      <footer className="border-t border-slate-100 bg-white">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-5 py-8 text-sm font-bold text-slate-500 md:flex-row md:items-center md:justify-between">
          <div className="space-y-1">
            <p>ПРОКАТило — аренда вещей для редких задач рядом с домом.</p>
            <address className="font-semibold not-italic text-slate-500">
              {BUSINESS_ADDRESS} ·{" "}
              <a href={BUSINESS_PHONE_HREF}>{BUSINESS_PHONE_DISPLAY}</a>
            </address>
          </div>
          <div className="flex flex-wrap gap-4">
            <Link href="/contacts">Контакты</Link>
            <Link href="/terms">Пользовательское соглашение</Link>
            <Link href="/privacy">Политика данных</Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
