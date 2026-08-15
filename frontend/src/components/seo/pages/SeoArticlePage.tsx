import { JsonLdScript } from "@/components/seo/JsonLdScript";
import { SeoArticleGuide } from "@/components/seo/SeoArticleGuide";
import { SeoFaqList } from "@/components/seo/SeoFaqList";
import { SeoPublicHero } from "@/components/seo/SeoPagePrimitives";
import { SeoSiteFooter, SeoSiteHeader } from "@/components/seo/SeoSiteChrome";
import { buildJsonLd } from "@/lib/seo/jsonld";
import type { SeoPageConfig } from "@/lib/seo/site";

export function SeoArticlePage({ page }: { page: SeoPageConfig }) {
  return (
    <main className="min-h-screen bg-white text-slate-950">
      <JsonLdScript entities={buildJsonLd(page)} />
      <SeoSiteHeader />
      <SeoPublicHero page={page} />
      <SeoArticleGuide page={page} />
      {page.faqs && (
        <section className="border-y border-slate-100 bg-slate-50">
          <div className="mx-auto grid max-w-6xl gap-8 px-5 py-14 lg:grid-cols-[0.7fr_1.3fr] lg:py-20">
            <div>
              <p className="text-sm font-black uppercase text-orange-700">По теме</p>
              <h2 className="mt-2 text-3xl font-black text-slate-950 sm:text-4xl">Частые вопросы</h2>
            </div>
            <SeoFaqList faqs={page.faqs} />
          </div>
        </section>
      )}
      <SeoSiteFooter />
    </main>
  );
}
