import { ArrowRight, ChevronRight } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

import type { BreadcrumbItem, SeoPageConfig } from "@/lib/seo/site";

export function SeoActionLink({
  href,
  children,
  variant = "secondary",
}: {
  href: string;
  children: ReactNode;
  variant?: "primary" | "secondary";
}) {
  const className = variant === "primary"
    ? "inline-flex min-h-14 items-center justify-center gap-2 rounded-2xl bg-gradient-to-br from-amber-400 via-orange-500 to-rose-600 px-6 text-base font-black text-white shadow-lg shadow-rose-100 transition hover:brightness-105"
    : "inline-flex min-h-14 items-center justify-center rounded-2xl border border-slate-200 bg-white px-6 text-base font-black text-slate-700 transition hover:border-orange-200";

  return (
    <Link href={href} className={className}>
      {children}
      {variant === "primary" && <ArrowRight size={18} />}
    </Link>
  );
}

export function SeoBreadcrumbs({ items }: { items: BreadcrumbItem[] }) {
  const previous = items.at(-2) ?? items[0];

  return (
    <>
      <nav aria-label="Хлебные крошки" className="hidden items-center gap-1.5 text-sm font-bold text-slate-500 sm:flex">
        {items.map((item, index) => (
          <span key={item.path} className="flex items-center gap-1.5">
            {index > 0 && <ChevronRight size={14} className="text-slate-300" />}
            {index === items.length - 1 ? (
              <span className="text-slate-700">{item.name}</span>
            ) : (
              <Link href={item.path} className="transition hover:text-slate-950">{item.name}</Link>
            )}
          </span>
        ))}
      </nav>
      {previous && (
        <Link href={previous.path} className="inline-flex items-center gap-1 text-sm font-black text-slate-600 sm:hidden">
          <ChevronRight size={16} className="rotate-180 text-orange-600" />
          {previous.name}
        </Link>
      )}
    </>
  );
}

export function SeoPublicHero({
  page,
  visual,
}: {
  page: SeoPageConfig;
  visual?: ReactNode;
}) {
  return (
    <section className="border-b border-slate-100 bg-white">
      <div className={`mx-auto max-w-6xl px-5 py-12 sm:py-16 lg:py-20 ${visual ? "grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center" : ""}`}>
        <div>
          <SeoBreadcrumbs items={page.breadcrumbs} />
          {page.eyebrow && (
            <p className="mt-7 text-sm font-black uppercase text-orange-700 sm:mt-8">{page.eyebrow}</p>
          )}
          <h1 className="mt-3 max-w-4xl text-4xl font-black leading-[1.08] text-slate-950 sm:text-5xl lg:text-6xl">
            {page.h1}
          </h1>
          <p className="mt-5 max-w-2xl text-lg font-semibold leading-relaxed text-slate-600 sm:text-xl">
            {page.intro}
          </p>
          {(page.ctaLabel || page.secondaryCtaLabel) && (
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              {page.ctaLabel && page.ctaHref && (
                <SeoActionLink href={page.ctaHref} variant="primary">{page.ctaLabel}</SeoActionLink>
              )}
              {page.secondaryCtaLabel && page.secondaryCtaHref && (
                <SeoActionLink href={page.secondaryCtaHref}>{page.secondaryCtaLabel}</SeoActionLink>
              )}
            </div>
          )}
        </div>
        {visual}
      </div>
    </section>
  );
}
