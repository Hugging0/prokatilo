import { SeoProductPage } from "@/components/seo/product/SeoProductPage";
import { SeoArticlePage } from "@/components/seo/pages/SeoArticlePage";
import { SeoCatalogLandingPage } from "@/components/seo/pages/SeoCatalogLandingPage";
import { SeoStandardPage } from "@/components/seo/pages/SeoStandardPage";
import { SEO_CATALOG_ITEMS } from "@/lib/seo/content";
import { getLiveSeoCatalogItems } from "@/lib/seo/live-catalog";
import type { SeoPageConfig } from "@/lib/seo/site";

function needsLiveCatalog(page: SeoPageConfig) {
  return Boolean(page.catalogItem) ||
    page.path === "/" ||
    page.path === "/catalog" ||
    page.jsonLdType === "category";
}

export async function SeoPage({ page }: { page: SeoPageConfig }) {
  const catalogItems = needsLiveCatalog(page)
    ? await getLiveSeoCatalogItems()
    : SEO_CATALOG_ITEMS;
  const liveCatalogItem = page.catalogItem
    ? catalogItems.find((item) => item.appItemId === page.catalogItem?.appItemId)
    : undefined;
  const livePage = liveCatalogItem
    ? { ...page, catalogItem: liveCatalogItem }
    : page;

  if (livePage.catalogItem) {
    return <SeoProductPage page={livePage} catalogItems={catalogItems} />;
  }

  if (livePage.path === "/" || livePage.path === "/catalog") {
    return <SeoCatalogLandingPage page={livePage} catalogItems={catalogItems} />;
  }

  if (livePage.jsonLdType === "article") {
    return <SeoArticlePage page={livePage} />;
  }

  return <SeoStandardPage page={livePage} catalogItems={catalogItems} />;
}
