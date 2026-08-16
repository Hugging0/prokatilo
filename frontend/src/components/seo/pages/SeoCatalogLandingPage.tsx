import { ArrowRight, ChevronRight } from "lucide-react";
import Link from "next/link";

import { JsonLdScript } from "@/components/seo/JsonLdScript";
import { SeoFaqList } from "@/components/seo/SeoFaqList";
import { SeoRentalConditions } from "@/components/seo/SeoRentalConditions";
import { SeoSiteFooter, SeoSiteHeader } from "@/components/seo/SeoSiteChrome";
import { CatalogOrbit } from "@/components/seo/catalog/CatalogOrbit";
import { SEO_BLOG_POSTS, SEO_CATALOG_ITEMS } from "@/lib/seo/content";
import { buildJsonLd } from "@/lib/seo/jsonld";
import type { SeoPageConfig } from "@/lib/seo/site";

const CATALOG_ORBIT_ITEMS = SEO_CATALOG_ITEMS.map((item) => ({
  appItemId: item.appItemId,
  title: item.orbitTitle,
  description: item.orbitDescription,
  image: item.image,
  imageAlt: item.imageAlt,
  prices: item.prices,
}));

export function SeoCatalogLandingPage({ page }: { page: SeoPageConfig }) {
  const isHome = page.path === "/";

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <JsonLdScript entities={buildJsonLd(page)} />
      <SeoSiteHeader immersive />
      <CatalogOrbit
        heading={page.h1}
        intro={page.intro}
        mobileIntro={isHome ? "Для редких задач. Попользовались — вернули." : undefined}
        items={CATALOG_ORBIT_ITEMS}
      />
      <SeoRentalConditions />

      <section className="bg-slate-50">
        <div className="mx-auto grid max-w-6xl gap-10 px-5 py-14 md:grid-cols-2 lg:gap-16 lg:py-20">
          {page.sections.map((section) => (
            <article key={section.title} className="border-t border-slate-200 pt-6">
              <h2 className="text-2xl font-black text-slate-950">{section.title}</h2>
              <p className="mt-3 text-base font-semibold leading-relaxed text-slate-600">{section.body}</p>
              {section.items && (
                <ul className="mt-5 space-y-2 text-base font-bold text-slate-700">
                  {section.items.map((item) => <li key={item}>• {item}</li>)}
                </ul>
              )}
            </article>
          ))}
        </div>
      </section>

      {page.faqs && (
        <section className="bg-white">
          <div className="mx-auto grid max-w-6xl gap-8 px-5 py-14 lg:grid-cols-[0.7fr_1.3fr] lg:py-20">
            <div>
              <p className="text-sm font-black uppercase text-orange-700">Главное</p>
              <h2 className="mt-2 text-3xl font-black text-slate-950 sm:text-4xl">Частые вопросы</h2>
            </div>
            <SeoFaqList faqs={page.faqs} />
          </div>
        </section>
      )}

      {isHome && (
        <section className="border-t border-slate-100 bg-slate-50">
          <div className="mx-auto max-w-6xl px-5 py-14 lg:py-20">
            <p className="text-sm font-black uppercase text-orange-700">Блог</p>
            <h2 className="mt-2 text-3xl font-black text-slate-950 sm:text-4xl">Идеи для редких задач</h2>
            <div className="mt-8 grid gap-4 md:grid-cols-2">
              {SEO_BLOG_POSTS.map((post) => (
                <Link key={post.slug} href={`/blog/${post.slug}`} className="group rounded-[1.5rem] border border-slate-100 bg-white p-6 shadow-sm transition hover:border-orange-200">
                  <h3 className="text-xl font-black text-slate-950">{post.h1}</h3>
                  <p className="mt-3 text-base font-semibold leading-relaxed text-slate-600">{post.description}</p>
                  <span className="mt-5 inline-flex items-center gap-2 text-sm font-black text-slate-950">Читать <ArrowRight size={17} className="text-orange-600 transition group-hover:translate-x-1" /></span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {page.relatedLinks && (
        <nav aria-label="Полезные ссылки" className="border-t border-slate-100 bg-white">
          <div className="mx-auto grid max-w-6xl gap-px bg-slate-100 px-5 py-14 sm:grid-cols-2 lg:grid-cols-3 lg:py-20">
            {page.relatedLinks.map((link) => (
              <Link key={link.path} href={link.path} className="flex items-center justify-between gap-4 bg-white px-5 py-4 text-sm font-black text-slate-700 transition hover:text-orange-700">
                {link.name}<ChevronRight size={17} className="shrink-0 text-orange-600" />
              </Link>
            ))}
          </div>
        </nav>
      )}
      <SeoSiteFooter />
    </main>
  );
}
