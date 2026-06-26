import { SeoPage } from "@/components/seo/SeoPage";
import { buildSeoMetadata } from "@/lib/seo/metadata";
import { getSeoPage } from "@/lib/seo/pages";

const page = getSeoPage("/blog/robot-moyshchik-okon-arenda")!;

export const metadata = buildSeoMetadata(page);

export default function WindowRobotBlogSeoPage() {
  return <SeoPage page={page} />;
}
