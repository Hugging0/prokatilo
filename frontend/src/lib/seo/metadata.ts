import type { Metadata } from "next";

import {
  SEO_DEFAULT_IMAGE,
  SEO_SITE_NAME,
  SEO_SITE_URL,
  type SeoPageConfig,
} from "./site";

export function buildSeoMetadata(page: SeoPageConfig): Metadata {
  const canonical = new URL(page.path, SEO_SITE_URL).toString();
  const image = new URL(page.image ?? SEO_DEFAULT_IMAGE, SEO_SITE_URL).toString();

  return {
    title: page.title,
    description: page.description,
    alternates: {
      canonical,
    },
    openGraph: {
      title: page.title,
      description: page.description,
      url: canonical,
      siteName: SEO_SITE_NAME,
      locale: "ru_RU",
      type: page.jsonLdType === "article" ? "article" : "website",
      images: [
        {
          url: image,
          width: 512,
          height: 512,
          alt: page.imageAlt ?? page.h1,
        },
      ],
    },
    twitter: {
      card: "summary",
      title: page.title,
      description: page.description,
      images: [image],
    },
  };
}
