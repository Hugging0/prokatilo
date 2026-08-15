import { CircleHelp, Clock3, MapPin, PackageCheck, Truck } from "lucide-react";
import Image from "next/image";

import { SEO_CATALOG_ITEMS } from "@/lib/seo/content";
import type { SeoPageConfig } from "@/lib/seo/site";

function DeliveryVisual({ page }: { page: SeoPageConfig }) {
  const areas = page.sections[0]?.items ?? [];

  return (
    <div className="relative overflow-hidden rounded-[2rem] border border-slate-200 bg-slate-50 p-6 sm:p-8">
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-amber-400 via-orange-500 to-rose-600" />
      <div className="flex items-start justify-between gap-5">
        <div>
          <p className="text-sm font-black uppercase text-orange-700">Основная зона</p>
          <h2 className="mt-2 text-3xl font-black text-slate-950">Запад Москвы</h2>
        </div>
        <MapPin size={30} className="shrink-0 text-rose-600" />
      </div>
      <ul className="mt-7 grid gap-3 sm:grid-cols-2">
        {areas.map((area, index) => (
          <li key={area} className="flex items-start gap-3 text-sm font-black leading-snug text-slate-700">
            <span className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${index < 5 ? "bg-orange-500" : "border-2 border-orange-500 bg-white"}`} />
            {area}
          </li>
        ))}
      </ul>
      <p className="mt-7 border-t border-slate-200 pt-5 text-sm font-bold leading-relaxed text-slate-500">
        Точный адрес и стоимость маршрута оператор проверит до подтверждения заказа.
      </p>
    </div>
  );
}

function FaqVisual() {
  const topics = [
    { icon: Clock3, title: "Срок аренды", body: "От короткого тарифа до недели" },
    { icon: Truck, title: "Доставка", body: "Адрес и интервал подтверждает оператор" },
    { icon: PackageCheck, title: "Возврат", body: "Курьер забирает и сверяет комплект" },
  ];

  return (
    <div className="rounded-[2rem] border border-slate-200 bg-slate-50 p-6 sm:p-8">
      <div className="flex items-center gap-3">
        <CircleHelp size={28} className="text-orange-600" />
        <h2 className="text-xl font-black text-slate-950">Главное перед бронью</h2>
      </div>
      <div className="mt-6 divide-y divide-slate-200">
        {topics.map(({ icon: Icon, title, body }) => (
          <div key={title} className="flex gap-4 py-4 first:pt-0 last:pb-0">
            <Icon size={21} className="mt-0.5 shrink-0 text-rose-600" />
            <div>
              <h3 className="font-black text-slate-950">{title}</h3>
              <p className="mt-1 text-sm font-semibold leading-relaxed text-slate-500">{body}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function CategoryVisual({ page }: { page: SeoPageConfig }) {
  const categorySlug = page.path.replace("/catalog/", "");
  const items = SEO_CATALOG_ITEMS.filter((item) => item.categorySlug === categorySlug).slice(0, 2);

  return (
    <div className={`grid min-h-[340px] gap-3 overflow-hidden rounded-[2rem] bg-slate-100 p-4 sm:min-h-[430px] sm:p-6 ${items.length === 1 ? "grid-cols-1" : "grid-cols-2"}`}>
      {items.map((item, index) => (
        <div key={item.slug} className={`flex items-center justify-center ${items.length === 1 ? "p-8" : index === 1 ? "pt-12" : "pb-12"}`}>
          <Image
            src={item.image}
            alt={item.imageAlt}
            width={520}
            height={520}
            priority
            sizes="(max-width: 1023px) 42vw, 20vw"
            className="w-full object-contain drop-shadow-[0_24px_24px_rgba(15,23,42,0.14)]"
          />
        </div>
      ))}
    </div>
  );
}

function AboutVisual() {
  return (
    <div className="overflow-hidden rounded-[2rem] bg-gradient-to-br from-amber-400 via-orange-500 to-rose-600 p-8 text-white shadow-xl shadow-rose-100 sm:p-10">
      <p className="text-sm font-black uppercase text-white/75">ПРОКАТило</p>
      <p className="mt-8 text-4xl font-black leading-tight">Выбрали.<br />Попользовались.<br />Вернули.</p>
      <p className="mt-8 max-w-sm text-base font-bold leading-relaxed text-white/85">Вещь решает задачу и не остаётся занимать место дома.</p>
    </div>
  );
}

export function getStandardPageVisual(page: SeoPageConfig) {
  if (page.jsonLdType === "area") return <DeliveryVisual page={page} />;
  if (page.jsonLdType === "faq") return <FaqVisual />;
  if (page.jsonLdType === "category") return <CategoryVisual page={page} />;
  if (page.jsonLdType === "about") return <AboutVisual />;
  return undefined;
}
