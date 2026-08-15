import { JsonLdScript } from "@/components/seo/JsonLdScript";
import { SeoSiteFooter, SeoSiteHeader } from "@/components/seo/SeoSiteChrome";
import { buildJsonLd } from "@/lib/seo/jsonld";
import type { SeoPageConfig } from "@/lib/seo/site";

import { SeoProductDetails } from "./SeoProductDetails";
import { SeoProductHero } from "./SeoProductHero";

export function SeoProductPage({ page }: { page: SeoPageConfig }) {
  return (
    <main className="min-h-screen bg-slate-50 pb-20 text-slate-950 lg:pb-0">
      <JsonLdScript entities={buildJsonLd(page)} />
      <SeoSiteHeader />
      <SeoProductHero page={page} />
      <SeoProductDetails page={page} />
      <SeoSiteFooter />
    </main>
  );
}
