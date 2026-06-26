import { SeoPage } from "@/components/seo/SeoPage";
import { buildSeoMetadata } from "@/lib/seo/metadata";
import { getSeoPage } from "@/lib/seo/pages";

const page = getSeoPage("/about")!;

export const metadata = buildSeoMetadata(page);

export default function AboutSeoPage() {
  return <SeoPage page={page} />;
}
