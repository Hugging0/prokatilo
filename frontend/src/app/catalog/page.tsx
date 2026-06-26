import { SeoPage } from "@/components/seo/SeoPage";
import { buildSeoMetadata } from "@/lib/seo/metadata";
import { getSeoPage } from "@/lib/seo/pages";

const page = getSeoPage("/catalog")!;

export const metadata = buildSeoMetadata(page);

export default function CatalogSeoPage() {
  return <SeoPage page={page} />;
}
