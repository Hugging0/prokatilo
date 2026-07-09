import { SEO_CATALOG_ITEMS } from "./content";
import {
  BUSINESS_AREA_SERVED,
  BUSINESS_EMAIL,
  BUSINESS_LATITUDE,
  BUSINESS_LEGAL_NAME,
  BUSINESS_LONGITUDE,
  BUSINESS_PHONE,
  BUSINESS_SOCIAL_URLS,
  BUSINESS_STREET_ADDRESS,
} from "@/lib/business";
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

const ORGANIZATION_ID = absoluteUrl("/#organization");
const LOCAL_BUSINESS_ID = absoluteUrl("/#local-business");

const RENTAL_OFFERS = [
  { key: "short", name: "Аренда на 3 часа" },
  { key: "day", name: "Аренда на сутки" },
  { key: "week", name: "Аренда на неделю" },
] as const;

function postalAddressJsonLd(): JsonLdEntity {
  return {
    "@type": "PostalAddress",
    streetAddress: BUSINESS_STREET_ADDRESS,
    addressLocality: "Москва",
    addressRegion: "Москва",
    addressCountry: "RU",
  };
}

function organizationJsonLd(): JsonLdEntity {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": ORGANIZATION_ID,
    name: SEO_SITE_NAME,
    legalName: BUSINESS_LEGAL_NAME,
    url: SEO_SITE_URL,
    logo: absoluteUrl(SEO_DEFAULT_IMAGE),
    email: BUSINESS_EMAIL,
    telephone: BUSINESS_PHONE,
    address: postalAddressJsonLd(),
    sameAs: [...BUSINESS_SOCIAL_URLS],
    contactPoint: {
      "@type": "ContactPoint",
      telephone: BUSINESS_PHONE,
      email: BUSINESS_EMAIL,
      contactType: "customer support",
      availableLanguage: "Russian",
      areaServed: "RU",
    },
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

  const item = page.catalogItem;
  const offers = RENTAL_OFFERS.map((offer) => ({
    "@type": "Offer",
    name: `${offer.name}: ${item.title}`,
    price: item.prices[offer.key],
    priceCurrency: "RUB",
    availability: "https://schema.org/LimitedAvailability",
    url: absoluteUrl(page.path),
    offeredBy: {
      "@type": "LocalBusiness",
      "@id": LOCAL_BUSINESS_ID,
      name: SEO_SITE_NAME,
    },
  }));

  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name: item.title,
    description: item.description,
    image: [absoluteUrl(item.image)],
    provider: {
      "@type": "LocalBusiness",
      "@id": LOCAL_BUSINESS_ID,
      name: SEO_SITE_NAME,
      url: SEO_SITE_URL,
    },
    areaServed: [...BUSINESS_AREA_SERVED],
    category: item.categoryTitle,
    serviceType: "Аренда вещей и техники",
    url: absoluteUrl(page.path),
    inLanguage: "ru-RU",
    offers,
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
    image: absoluteUrl(page.image ?? SEO_DEFAULT_IMAGE),
    inLanguage: "ru-RU",
    author: {
      "@type": "Organization",
      "@id": ORGANIZATION_ID,
      name: SEO_SITE_NAME,
    },
    publisher: {
      "@type": "Organization",
      "@id": ORGANIZATION_ID,
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
    "@id": LOCAL_BUSINESS_ID,
    name: SEO_SITE_NAME,
    legalName: BUSINESS_LEGAL_NAME,
    url: SEO_SITE_URL,
    image: absoluteUrl(SEO_DEFAULT_IMAGE),
    parentOrganization: {
      "@id": ORGANIZATION_ID,
    },
    telephone: BUSINESS_PHONE,
    email: BUSINESS_EMAIL,
    address: postalAddressJsonLd(),
    geo: {
      "@type": "GeoCoordinates",
      latitude: BUSINESS_LATITUDE,
      longitude: BUSINESS_LONGITUDE,
    },
    areaServed: [...BUSINESS_AREA_SERVED],
    sameAs: [...BUSINESS_SOCIAL_URLS],
    priceRange: "₽–₽₽",
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
