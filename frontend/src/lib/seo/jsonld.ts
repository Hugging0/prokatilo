import { SEO_CATALOG_ITEMS } from "./content";
import {
  SEO_DEFAULT_IMAGE,
  SEO_SITE_NAME,
  SEO_SITE_URL,
  type JsonLdEntity,
  type SeoPageConfig,
} from "./site";

function absoluteUrl(path: string) {
  return new URL(path, SEO_SITE_URL).toString();
}

function organizationJsonLd(): JsonLdEntity {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SEO_SITE_NAME,
    url: SEO_SITE_URL,
    logo: absoluteUrl(SEO_DEFAULT_IMAGE),
    sameAs: [],
  };
}

function breadcrumbsJsonLd(page: SeoPageConfig): JsonLdEntity {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: page.breadcrumbs.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

function faqJsonLd(page: SeoPageConfig): JsonLdEntity | null {
  if (!page.faqs?.length) return null;

  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: page.faqs.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };
}

function itemServiceJsonLd(page: SeoPageConfig): JsonLdEntity | null {
  if (!page.catalogItem) return null;

  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name: page.catalogItem.title,
    description: page.catalogItem.description,
    image: [absoluteUrl(page.catalogItem.image)],
    provider: {
      "@type": "Organization",
      name: SEO_SITE_NAME,
      url: SEO_SITE_URL,
    },
    areaServed: [
      "Очаково-Матвеевское",
      "ЖК Мичуринский парк",
      "Раменки",
      "Никулино",
      "Солнцево",
    ],
    category: page.catalogItem.categoryTitle,
    serviceType: "Аренда вещей и техники",
    url: absoluteUrl(page.path),
  };
}

function itemListJsonLd(page: SeoPageConfig): JsonLdEntity | null {
  if (page.jsonLdType !== "catalog" && page.jsonLdType !== "category") {
    return null;
  }

  const items =
    page.jsonLdType === "category"
      ? SEO_CATALOG_ITEMS.filter((item) =>
          page.path.endsWith(item.categorySlug),
        )
      : SEO_CATALOG_ITEMS;

  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: page.h1,
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      url: absoluteUrl(`/rent/${item.slug}`),
      name: item.title,
    })),
  };
}

function articleJsonLd(page: SeoPageConfig): JsonLdEntity | null {
  if (page.jsonLdType !== "article") return null;

  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: page.h1,
    description: page.description,
    dateModified: page.updatedAt,
    datePublished: page.updatedAt,
    author: {
      "@type": "Organization",
      name: SEO_SITE_NAME,
    },
    publisher: {
      "@type": "Organization",
      name: SEO_SITE_NAME,
      logo: {
        "@type": "ImageObject",
        url: absoluteUrl(SEO_DEFAULT_IMAGE),
      },
    },
    mainEntityOfPage: absoluteUrl(page.path),
  };
}

function localBusinessJsonLd(page: SeoPageConfig): JsonLdEntity | null {
  if (page.jsonLdType !== "home" && page.jsonLdType !== "area") return null;

  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: SEO_SITE_NAME,
    url: SEO_SITE_URL,
    image: absoluteUrl(SEO_DEFAULT_IMAGE),
    areaServed: [
      "Очаково-Матвеевское",
      "ЖК Мичуринский парк",
      "Раменки",
      "Никулино",
      "Солнцево",
    ],
    description: page.description,
  };
}

export function buildJsonLd(page: SeoPageConfig): JsonLdEntity[] {
  return [
    organizationJsonLd(),
    breadcrumbsJsonLd(page),
    localBusinessJsonLd(page),
    itemListJsonLd(page),
    itemServiceJsonLd(page),
    articleJsonLd(page),
    faqJsonLd(page),
  ].filter(Boolean) as JsonLdEntity[];
}
