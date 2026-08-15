import { SeoProductPage } from "@/components/seo/product/SeoProductPage";
import { SeoArticlePage } from "@/components/seo/pages/SeoArticlePage";
import { SeoCatalogLandingPage } from "@/components/seo/pages/SeoCatalogLandingPage";
import { SeoStandardPage } from "@/components/seo/pages/SeoStandardPage";
import type { SeoPageConfig } from "@/lib/seo/site";

export function SeoPage({ page }: { page: SeoPageConfig }) {
  if (page.catalogItem) {
    return <SeoProductPage page={page} />;
  }

  if (page.path === "/" || page.path === "/catalog") {
    return <SeoCatalogLandingPage page={page} />;
  }

  if (page.jsonLdType === "article") {
    return <SeoArticlePage page={page} />;
  }

  return <SeoStandardPage page={page} />;
}
