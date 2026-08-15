import { Check, ChevronRight } from "lucide-react";
import Link from "next/link";

import type { SeoPageConfig } from "@/lib/seo/site";

interface SeoArticleGuideProps {
  page: SeoPageConfig;
}

export function SeoArticleGuide({ page }: SeoArticleGuideProps) {
  return (
    <section className="bg-white">
      <div className="mx-auto grid max-w-6xl gap-12 px-5 py-14 lg:grid-cols-[minmax(0,1fr)_18rem] lg:items-start lg:py-20">
        <article>
          <div className="max-w-3xl space-y-12">
            {page.sections.map((section, sectionIndex) => (
              <section key={section.title} className="border-t border-slate-200 pt-7 first:border-t-0 first:pt-0">
                <p className="text-sm font-black text-orange-700">0{sectionIndex + 1}</p>
                <h2 className="mt-3 text-2xl font-black text-slate-950 sm:text-3xl">
                  {section.title}
                </h2>
                <p className="mt-4 text-lg font-semibold leading-relaxed text-slate-600">
                  {section.body}
                </p>
                {section.items && (
                  <ul className="mt-5 space-y-3">
                    {section.items.map((item) => (
                      <li key={item} className="flex gap-3 text-base font-bold leading-relaxed text-slate-700">
                        <Check size={19} className="mt-0.5 shrink-0 text-orange-600" strokeWidth={3} />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            ))}
          </div>
        </article>

        {page.relatedLinks && (
          <aside className="border-t border-slate-200 pt-5 lg:sticky lg:top-6">
            <h2 className="text-lg font-black text-slate-950">В тему</h2>
            <div className="mt-4 divide-y divide-slate-200 border-b border-slate-200">
              {page.relatedLinks.map((link) => (
                <Link
                  key={link.path}
                  href={link.path}
                  className="flex items-start justify-between gap-3 py-4 text-sm font-black leading-snug text-slate-700 transition hover:text-orange-700"
                >
                  {link.name}
                  <ChevronRight size={16} className="shrink-0 text-orange-600" />
                </Link>
              ))}
            </div>
          </aside>
        )}
      </div>
    </section>
  );
}
