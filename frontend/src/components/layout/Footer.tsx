import Link from "next/link";

const FOOTER_LINKS = [
  { href: "/contacts", label: "Контакты" },
  { href: "/terms", label: "Пользовательское соглашение" },
  {
    href: "/privacy",
    label: "Политика обработки персональных данных",
  },
  {
    href: "/consent",
    label: "Согласие на обработку персональных данных",
  },
  { href: "/delivery-payment", label: "Доставка и оплата" },
];

export function Footer({ withNavigation = false }: { withNavigation?: boolean }) {
  const year = new Date().getFullYear();

  return (
    <footer
      className={`mx-auto max-w-5xl px-5 pt-8 ${
        withNavigation ? "pb-36" : "pb-10"
      }`}
    >
      <div className="rounded-[1.75rem] border border-slate-100 bg-white px-5 py-5 shadow-lg shadow-slate-200/60">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-base font-black text-slate-950">
              © ПРОКАТило, {year}
            </p>
            <p className="mt-1 text-sm font-bold leading-relaxed text-slate-500">
              Сервис аренды вещей и техники
            </p>
            <p className="mt-1 text-sm font-bold leading-relaxed text-slate-500">
              Поддержка: Prokatilo.corp@gmail.com
            </p>
          </div>

          <nav className="flex flex-wrap gap-x-4 gap-y-2 sm:max-w-xl sm:justify-end">
            {FOOTER_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-extrabold leading-relaxed text-slate-500 transition-colors hover:text-orange-600"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </footer>
  );
}
