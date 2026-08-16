import { JsonLdScript } from "@/components/seo/JsonLdScript";
import { SeoPublicHero } from "@/components/seo/SeoPagePrimitives";
import { SeoSiteFooter, SeoSiteHeader } from "@/components/seo/SeoSiteChrome";
import { buildJsonLd } from "@/lib/seo/jsonld";
import type { SeoCatalogItem, SeoPageConfig } from "@/lib/seo/site";

import { SeoStandardSections } from "./SeoStandardSections";
import { getStandardPageVisual } from "./SeoStandardVisuals";

export function SeoStandardPage({
  page,
  catalogItems,
}: {
  page: SeoPageConfig;
  catalogItems: SeoCatalogItem[];
}) {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <JsonLdScript entities={buildJsonLd(page, catalogItems)} />
      <SeoSiteHeader />
      <SeoPublicHero page={page} visual={getStandardPageVisual(page)} />
      <SeoStandardSections page={page} catalogItems={catalogItems} />
      <SeoSiteFooter />
    </main>
  );
}
