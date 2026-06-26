import { SeoPage } from "@/components/seo/SeoPage";
import { buildSeoMetadata } from "@/lib/seo/metadata";
import { getSeoPage } from "@/lib/seo/pages";

const page = getSeoPage("/blog/arenda-ps5-na-vecher")!;

export const metadata = buildSeoMetadata(page);

export default function Ps5EveningSeoPage() {
  return <SeoPage page={page} />;
}
