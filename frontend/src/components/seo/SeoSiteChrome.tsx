import Link from "next/link";

import {
  BUSINESS_ADDRESS,
  BUSINESS_PHONE_DISPLAY,
  BUSINESS_PHONE_HREF,
} from "@/lib/business";

export function SeoSiteHeader({ immersive = false }: { immersive?: boolean }) {
  return (
    <header
      className={`relative z-50 border-b border-slate-100 bg-white ${immersive ? "h-[68px] sm:h-[78px]" : ""}`}
    >
      <div
        className={`mx-auto flex h-full items-center justify-between gap-4 px-5 ${immersive ? "max-w-none sm:px-8 lg:px-[52px]" : "max-w-6xl py-4"}`}
      >
        <Link
          href="/"
          aria-label={immersive ? "ПРОКАТило — главная" : undefined}
          className="inline-flex items-center text-xl font-black italic text-slate-950"
        >
          ПРОКАТило
        </Link>

        <nav className="hidden items-center gap-5 text-sm font-black text-slate-600 sm:flex">
          <Link href="/catalog" className="transition hover:text-slate-950">
            Каталог
          </Link>
          <Link href="/delivery-area" className="transition hover:text-slate-950">
            Доставка
          </Link>
          <Link href="/faq" className="transition hover:text-slate-950">
            FAQ
          </Link>
        </nav>

        <Link
          href="/app"
          className={
            immersive
              ? "inline-flex min-h-11 items-center whitespace-nowrap rounded-2xl bg-gradient-to-br from-amber-400 via-orange-500 to-rose-600 px-4 text-sm font-black text-white shadow-lg shadow-rose-100 transition hover:brightness-105 sm:min-h-12 sm:px-5"
              : "rounded-2xl bg-slate-950 px-4 py-2 text-sm font-black text-white transition hover:bg-slate-800"
          }
        >
          {immersive ? "Открыть приложение" : "В приложение"}
        </Link>
      </div>
    </header>
  );
}

export function SeoSiteFooter() {
  return (
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
  );
}
