import { JsonLdScript } from "@/components/seo/JsonLdScript";
import { SeoSiteFooter, SeoSiteHeader } from "@/components/seo/SeoSiteChrome";
import { buildJsonLd } from "@/lib/seo/jsonld";
import type { SeoCatalogItem, SeoPageConfig } from "@/lib/seo/site";

import { SeoProductDetails } from "./SeoProductDetails";
import { SeoProductHero } from "./SeoProductHero";

export function SeoProductPage({
  page,
  catalogItems,
}: {
  page: SeoPageConfig;
  catalogItems: SeoCatalogItem[];
}) {
  return (
    <main className="min-h-screen bg-slate-50 pb-20 text-slate-950 lg:pb-0">
      <JsonLdScript entities={buildJsonLd(page, catalogItems)} />
      <SeoSiteHeader />
      <SeoProductHero page={page} />
      <SeoProductDetails page={page} catalogItems={catalogItems} />
      <SeoSiteFooter />
    </main>
  );
}
