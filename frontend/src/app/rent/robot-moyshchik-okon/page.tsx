import { SeoPage } from "@/components/seo/SeoPage";
import { buildSeoMetadata } from "@/lib/seo/metadata";
import { getSeoPage } from "@/lib/seo/pages";

const page = getSeoPage("/rent/robot-moyshchik-okon")!;

export const metadata = buildSeoMetadata(page);

export default function WindowCleanerSeoPage() {
  return <SeoPage page={page} />;
}
