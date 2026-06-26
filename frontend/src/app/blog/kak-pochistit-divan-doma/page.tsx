import { SeoPage } from "@/components/seo/SeoPage";
import { buildSeoMetadata } from "@/lib/seo/metadata";
import { getSeoPage } from "@/lib/seo/pages";

const page = getSeoPage("/blog/kak-pochistit-divan-doma")!;

export const metadata = buildSeoMetadata(page);

export default function SofaCleaningSeoPage() {
  return <SeoPage page={page} />;
}
