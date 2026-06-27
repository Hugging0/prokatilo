import type { MetadataRoute } from "next";

export const SEO_SITE_URL = "https://myprokatilo.ru";
export const SEO_SITE_NAME = "ПРОКАТило";
export const SEO_SITE_DESCRIPTION =
  "Локальный сервис аренды вещей и техники рядом с домом: для редких задач, разумного потребления и жизни без лишнего хлама дома.";
export const SEO_DEFAULT_IMAGE = "/icons/prokatilo-icon-512.png";
export const SEO_UPDATED_AT = "2026-06-27";

export type SeoRoute =
  | "/"
  | "/catalog"
  | "/catalog/igrovye-pristavki"
  | "/catalog/uborka"
  | "/rent/ps5"
  | "/rent/playstation-vr"
  | "/rent/robot-moyshchik-okon"
  | "/rent/moyushchiy-pylesos-dlya-mebeli"
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
  slug: string;
  title: string;
  shortTitle: string;
  categorySlug: "igrovye-pristavki" | "uborka";
  categoryTitle: string;
  description: string;
  metaDescription: string;
  image: string;
  imageAlt: string;
  fromPrice: string;
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
