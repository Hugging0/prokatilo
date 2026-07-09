import Link from "next/link";

import type { SeoPageConfig } from "@/lib/seo/site";

interface SeoArticleGuideProps {
  page: SeoPageConfig;
}

export function SeoArticleGuide({ page }: SeoArticleGuideProps) {
  return (
    <section className="bg-white">
      <div className="mx-auto grid max-w-6xl gap-8 px-5 py-12 lg:grid-cols-[minmax(0,1fr)_18rem] lg:items-start">
        <article>
          <div className="max-w-3xl space-y-8">
            {page.sections.map((section) => (
              <section key={section.title}>
                <h2 className="text-2xl font-black tracking-tight text-slate-950">
                  {section.title}
                </h2>
                <p className="mt-3 text-base font-semibold leading-relaxed text-slate-600">
                  {section.body}
                </p>
                {section.items && (
                  <ul className="mt-4 space-y-2">
                    {section.items.map((item) => (
                      <li
                        key={item}
                        className="rounded-2xl bg-slate-50 px-4 py-3 text-base font-bold leading-relaxed text-slate-700"
                      >
                        {item}
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            ))}
          </div>
        </article>

        {page.relatedLinks && (
          <aside className="rounded-[1.75rem] border border-slate-100 bg-slate-50 p-5 shadow-sm lg:sticky lg:top-6">
            <h2 className="text-lg font-black tracking-tight text-slate-950">
              В тему
            </h2>
            <div className="mt-4 grid gap-3">
              {page.relatedLinks.map((link) => (
                <Link
                  key={link.path}
                  href={link.path}
                  className="rounded-2xl border border-slate-100 bg-white px-4 py-3 text-sm font-black leading-snug text-slate-700 shadow-sm transition hover:border-orange-200 hover:text-orange-700"
                >
                  {link.name}
                </Link>
              ))}
            </div>
          </aside>
        )}
      </div>
    </section>
  );
}
