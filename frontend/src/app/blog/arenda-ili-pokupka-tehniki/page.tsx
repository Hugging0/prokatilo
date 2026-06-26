import { SeoPage } from "@/components/seo/SeoPage";
import { buildSeoMetadata } from "@/lib/seo/metadata";
import { getSeoPage } from "@/lib/seo/pages";

const page = getSeoPage("/blog/arenda-ili-pokupka-tehniki")!;

export const metadata = buildSeoMetadata(page);

export default function RentOrBuySeoPage() {
  return <SeoPage page={page} />;
}
