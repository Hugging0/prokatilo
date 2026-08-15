import { ArrowRight, Check, MapPin, Route, Truck } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { SeoFaqList } from "@/components/seo/SeoFaqList";
import { SEO_BLOG_POSTS, SEO_CATALOG_ITEMS } from "@/lib/seo/content";
import type { SeoPageConfig } from "@/lib/seo/site";

const moneyFormatter = new Intl.NumberFormat("ru-RU");

function CategorySections({ page }: { page: SeoPageConfig }) {
  const categorySlug = page.path.replace("/catalog/", "");
  const items = SEO_CATALOG_ITEMS.filter((item) => item.categorySlug === categorySlug);

  return (
    <section className="bg-slate-50">
      <div className="mx-auto max-w-6xl px-5 py-14 lg:py-20">
        <p className="text-sm font-black uppercase text-orange-700">Актуальный каталог</p>
        <h2 className="mt-2 text-3xl font-black text-slate-950 sm:text-4xl">Что можно взять</h2>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <Link
              key={item.slug}
              href={`/rent/${item.slug}`}
              className="group rounded-[1.5rem] border border-slate-100 bg-white p-4 shadow-sm transition hover:border-orange-200"
            >
              <div className="flex aspect-square items-center justify-center rounded-2xl bg-slate-100 p-6">
                <Image
                  src={item.image}
                  alt={item.imageAlt}
                  width={520}
                  height={520}
                  sizes="(max-width: 639px) calc(100vw - 4.5rem), 30vw"
                  className="h-full w-full object-contain transition duration-300 group-hover:scale-105"
                />
              </div>
              <h3 className="mt-5 text-xl font-black leading-snug text-slate-950">{item.title}</h3>
              <p className="mt-2 text-sm font-bold text-slate-500">от {moneyFormatter.format(item.prices.short)} ₽ · 3 часа</p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

function DeliverySections({ page }: { page: SeoPageConfig }) {
  const [area, ...details] = page.sections;
  const icons = [Route, MapPin, Truck];

  return (
    <>
      {area && (
        <section className="bg-white">
          <div className="mx-auto grid max-w-6xl gap-6 px-5 py-14 lg:grid-cols-[0.7fr_1.3fr] lg:py-20">
            <h2 className="text-3xl font-black text-slate-950 sm:text-4xl">{area.title}</h2>
            <p className="max-w-2xl text-lg font-semibold leading-relaxed text-slate-600">{area.body}</p>
          </div>
        </section>
      )}
      <section className="border-y border-slate-100 bg-slate-50">
        <div className="mx-auto grid max-w-6xl gap-8 px-5 py-14 md:grid-cols-3 lg:py-20">
          {details.map((section, index) => {
            const Icon = icons[index] ?? MapPin;
            return (
              <article key={section.title} className="border-t border-slate-200 pt-5">
                <Icon size={24} className="text-orange-600" />
                <h2 className="mt-4 text-xl font-black text-slate-950">{section.title}</h2>
                <p className="mt-3 text-base font-semibold leading-relaxed text-slate-600">{section.body}</p>
              </article>
            );
          })}
        </div>
      </section>
    </>
  );
}

function FaqSections({ page }: { page: SeoPageConfig }) {
  return (
    <>
      {page.sections[0] && (
        <section className="border-b border-slate-100 bg-slate-50">
          <div className="mx-auto grid max-w-6xl gap-6 px-5 py-12 lg:grid-cols-[0.7fr_1.3fr] lg:py-16">
            <h2 className="text-2xl font-black text-slate-950">{page.sections[0].title}</h2>
            <p className="text-base font-semibold leading-relaxed text-slate-600">{page.sections[0].body}</p>
          </div>
        </section>
      )}
      {page.faqs && (
        <section className="bg-white">
          <div className="mx-auto grid max-w-6xl gap-8 px-5 py-14 lg:grid-cols-[0.7fr_1.3fr] lg:py-20">
            <div>
              <p className="text-sm font-black uppercase text-orange-700">Подробно</p>
              <h2 className="mt-2 text-3xl font-black text-slate-950 sm:text-4xl">Частые вопросы</h2>
            </div>
            <SeoFaqList faqs={page.faqs} />
          </div>
        </section>
      )}
    </>
  );
}

function AboutSections({ page }: { page: SeoPageConfig }) {
  return (
    <section className="bg-white">
      <div className="mx-auto grid max-w-6xl gap-10 px-5 py-14 md:grid-cols-2 lg:gap-16 lg:py-20">
        {page.sections.map((section) => (
          <article key={section.title} className="border-t border-slate-200 pt-6">
            <Check size={24} className="text-orange-600" strokeWidth={3} />
            <h2 className="mt-5 text-2xl font-black text-slate-950">{section.title}</h2>
            <p className="mt-3 text-base font-semibold leading-relaxed text-slate-600">{section.body}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

function BlogSections() {
  return (
    <section className="bg-slate-50">
      <div className="mx-auto max-w-6xl px-5 py-14 lg:py-20">
        <p className="text-sm font-black uppercase text-orange-700">Все материалы</p>
        <h2 className="mt-2 text-3xl font-black text-slate-950 sm:text-4xl">Практичные разборы</h2>
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {SEO_BLOG_POSTS.map((post, index) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="group flex min-h-64 flex-col justify-between rounded-[1.5rem] border border-slate-100 bg-white p-6 shadow-sm transition hover:border-orange-200"
            >
              <div>
                <p className="text-sm font-black text-orange-700">0{index + 1}</p>
                <h3 className="mt-4 text-2xl font-black leading-tight text-slate-950">{post.h1}</h3>
                <p className="mt-3 text-base font-semibold leading-relaxed text-slate-600">{post.description}</p>
              </div>
              <span className="mt-6 inline-flex items-center gap-2 text-sm font-black text-slate-950">
                Читать <ArrowRight size={17} className="text-orange-600 transition group-hover:translate-x-1" />
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

export function SeoStandardSections({ page }: { page: SeoPageConfig }) {
  if (page.jsonLdType === "category") return <CategorySections page={page} />;
  if (page.jsonLdType === "area") return <DeliverySections page={page} />;
  if (page.jsonLdType === "faq") return <FaqSections page={page} />;
  if (page.jsonLdType === "about") return <AboutSections page={page} />;
  if (page.jsonLdType === "blog") return <BlogSections />;
  return <AboutSections page={page} />;
}
