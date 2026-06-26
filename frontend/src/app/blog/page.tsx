import { SeoPage } from "@/components/seo/SeoPage";
import { buildSeoMetadata } from "@/lib/seo/metadata";
import { getSeoPage } from "@/lib/seo/pages";

const page = getSeoPage("/blog")!;

export const metadata = buildSeoMetadata(page);

export default function BlogSeoPage() {
  return <SeoPage page={page} />;
}
