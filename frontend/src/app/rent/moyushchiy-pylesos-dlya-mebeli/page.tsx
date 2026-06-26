import { SeoPage } from "@/components/seo/SeoPage";
import { buildSeoMetadata } from "@/lib/seo/metadata";
import { getSeoPage } from "@/lib/seo/pages";

const page = getSeoPage("/rent/moyushchiy-pylesos-dlya-mebeli")!;

export const metadata = buildSeoMetadata(page);

export default function FurnitureExtractorSeoPage() {
  return <SeoPage page={page} />;
}
