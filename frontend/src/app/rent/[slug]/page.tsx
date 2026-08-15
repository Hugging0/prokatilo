import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { SeoPage } from "@/components/seo/SeoPage";
import { SEO_CATALOG_ITEMS } from "@/lib/seo/content";
import { buildSeoMetadata } from "@/lib/seo/metadata";
import { getSeoProductPage } from "@/lib/seo/pages";

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export const dynamicParams = false;

export function generateStaticParams() {
  return SEO_CATALOG_ITEMS.map((item) => ({ slug: item.slug }));
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const page = getSeoProductPage(slug);

  return page ? buildSeoMetadata(page) : {};
}

export default async function ProductSeoPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const page = getSeoProductPage(slug);

  if (!page) notFound();

  return <SeoPage page={page} />;
}
