import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { SeoPage } from "@/components/seo/SeoPage";
import { SEO_CATEGORIES } from "@/lib/seo/content";
import { buildSeoMetadata } from "@/lib/seo/metadata";
import { getSeoPage } from "@/lib/seo/pages";
import type { SeoCategorySlug } from "@/lib/seo/site";

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
}

export const dynamicParams = false;

export function generateStaticParams() {
  return SEO_CATEGORIES.map((category) => ({ slug: category.slug }));
}

function getCategoryPage(slug: string) {
  const category = SEO_CATEGORIES.find((candidate) => candidate.slug === slug);
  return category ? getSeoPage(`/catalog/${category.slug as SeoCategorySlug}`) : undefined;
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const page = getCategoryPage(slug);

  return page ? buildSeoMetadata(page) : {};
}

export default async function CategorySeoPage({ params }: CategoryPageProps) {
  const { slug } = await params;
  const page = getCategoryPage(slug);

  if (!page) notFound();

  return <SeoPage page={page} />;
}
