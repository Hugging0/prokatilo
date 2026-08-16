import type { MetadataRoute } from "next";

export const SEO_SITE_URL = "https://myprokatilo.ru";
export const SEO_SITE_NAME = "ПРОКАТило";
export const SEO_SITE_DESCRIPTION =
  "Локальный сервис аренды вещей и техники рядом с домом: для редких задач, разумного потребления и жизни без лишнего хлама дома.";
export const SEO_DEFAULT_IMAGE = "/icons/prokatilo-icon-512.png";
export const SEO_UPDATED_AT = "2026-08-15";

export type SeoCategorySlug =
  | "igrovye-pristavki"
  | "uborka"
  | "foto"
  | "instrumenty"
  | "gadzhety";

export type SeoProductSlug =
  | "ps5"
  | "playstation-vr"
  | "robot-moyshchik-okon"
  | "moyushchiy-pylesos-dlya-mebeli"
  | "instax-square-sq1"
  | "xbox-series-s"
  | "perforator-sds-plus"
  | "elektrootvertka-makita-df001dw"
  | "mikronaushnik-mxmedia-black-magnet";

export type SeoRoute =
  | "/"
  | "/catalog"
  | `/catalog/${SeoCategorySlug}`
  | `/rent/${SeoProductSlug}`
  | "/delivery-area"
  | "/faq"
  | "/about"
  | "/blog"
  | "/blog/arenda-ili-pokupka-tehniki"
  | "/blog/arenda-ps5-na-vecher"
  | "/blog/kak-pochistit-divan-doma"
  | "/blog/robot-moyshchik-okon-arenda"
  | "/privacy"
  | "/terms"
  | "/consent"
  | "/contacts"
  | "/delivery-payment";

export interface BreadcrumbItem {
  name: string;
  path: SeoRoute;
}

export type JsonLdEntity = Record<string, unknown>;

export interface SeoCatalogItem {
  appItemId: number;
  slug: SeoProductSlug;
  seoTitle: string;
  title: string;
  shortTitle: string;
  orbitTitle: string;
  orbitDescription: string;
  categorySlug: SeoCategorySlug;
  categoryTitle: string;
  description: string;
  metaDescription: string;
  image: string;
  imageAlt: string;
  gallery?: Array<{
    src: string;
    alt: string;
    caption: string;
  }>;
  fromPrice: string;
  prices: {
    short: number;
    day: number;
    week: number;
  };
  includedItems: string[];
  importantNotes: string[];
  bestFor: string[];
  faqs: SeoFaqItem[];
}

export interface SeoFaqItem {
  question: string;
  answer: string;
}

export interface SeoSection {
  title: string;
  body: string;
  items?: string[];
}

export interface SeoBlogPost {
  slug:
    | "arenda-ili-pokupka-tehniki"
    | "arenda-ps5-na-vecher"
    | "kak-pochistit-divan-doma"
    | "robot-moyshchik-okon-arenda";
  title: string;
  description: string;
  metaDescription: string;
  h1: string;
  intro: string;
  sections: SeoSection[];
  faqs: SeoFaqItem[];
  relatedLinks: BreadcrumbItem[];
}

export interface SeoPageConfig {
  path: SeoRoute;
  title: string;
  description: string;
  h1: string;
  eyebrow?: string;
  intro: string;
  updatedAt: string;
  changeFrequency?: MetadataRoute.Sitemap[number]["changeFrequency"];
  priority?: number;
  breadcrumbs: BreadcrumbItem[];
  sections: SeoSection[];
  ctaLabel?: string;
  ctaHref?: string;
  secondaryCtaLabel?: string;
  secondaryCtaHref?: string;
  faqs?: SeoFaqItem[];
  relatedLinks?: BreadcrumbItem[];
  image?: string;
  imageAlt?: string;
  jsonLdType?: "home" | "catalog" | "category" | "item" | "area" | "faq" | "about" | "blog" | "article";
  catalogItem?: SeoCatalogItem;
}
