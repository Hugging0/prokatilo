import {
  SEO_BLOG_POSTS,
  SEO_CATALOG_ITEMS,
  SEO_CATEGORIES,
  SEO_HOME_FAQS,
} from "./content";
import type { SeoPageConfig, SeoRoute } from "./site";
import { SEO_UPDATED_AT } from "./site";

const homePage: SeoPageConfig = {
  path: "/",
  title: "ПРОКАТило — аренда вещей и техники рядом с домом",
  description:
    "Арендуйте редкую технику рядом с домом на западе Москвы: PS5, VR, робот-мойщик окон и моющий пылесос. Попользовались — вернули, без лишнего хлама.",
  h1: "Аренда вещей рядом с домом",
  eyebrow: "ПРОКАТило",
  intro:
    "Теплый локальный сервис для случаев, когда покупать не хочется: редкая уборка, игровой вечер, техника на сутки или неделю.",
  updatedAt: SEO_UPDATED_AT,
  changeFrequency: "weekly",
  priority: 1,
  breadcrumbs: [{ name: "Главная", path: "/" }],
  image: "/icons/prokatilo-icon-512.png",
  imageAlt: "ПРОКАТило — аренда вещей и техники рядом с домом",
  ctaLabel: "Открыть приложение",
  ctaHref: "/app",
  secondaryCtaLabel: "Посмотреть зону доставки",
  secondaryCtaHref: "/delivery-area",
  jsonLdType: "home",
  sections: [
    {
      title: "Когда вещь нужна на один раз",
      body: "ПРОКАТило помогает взять технику для редких задач: поиграть вечером, почистить диван, помыть окна или попробовать устройство перед покупкой.",
      items: [
        "без лишнего хлама дома",
        "понятная бронь через приложение",
        "поддержка и оператор на связи",
      ],
    },
    {
      title: "Локальная зона обслуживания",
      body: "Основной фокус — районы рядом с Очаково-Матвеевским: ЖК Мичуринский парк, Раменки, Никулино, Солнцево и соседние адреса.",
    },
  ],
  faqs: SEO_HOME_FAQS,
  relatedLinks: [
    { name: "Каталог", path: "/catalog" },
    { name: "FAQ", path: "/faq" },
    { name: "О сервисе", path: "/about" },
  ],
};

const catalogPage: SeoPageConfig = {
  path: "/catalog",
  title: "Аренда вещей и техники в Москве | ПРОКАТило",
  description:
    "Каталог вещей и техники в аренду на западе Москвы: PS5, VR, робот-мойщик окон и моющий пылесос. Выберите срок и оформите бронь онлайн.",
  h1: "Аренда вещей рядом с домом",
  intro: "Для редких задач. Попользовались — вернули.",
  updatedAt: SEO_UPDATED_AT,
  changeFrequency: "weekly",
  priority: 0.9,
  breadcrumbs: [
    { name: "Главная", path: "/" },
    { name: "Каталог", path: "/catalog" },
  ],
  ctaLabel: "Перейти к бронированию",
  ctaHref: "/app",
  jsonLdType: "catalog",
  sections: [
    {
      title: "Игровые приставки",
      body: "Консоли и VR для вечера дома, выходных и знакомства с техникой без покупки.",
    },
    {
      title: "Техника для уборки",
      body: "Устройства для задач, которые случаются не каждый день: окна, диван, матрас, сезонная уборка.",
    },
  ],
  relatedLinks: [
    { name: "Аренда PlayStation 5", path: "/rent/ps5" },
    { name: "Аренда PlayStation VR", path: "/rent/playstation-vr" },
    { name: "Аренда робота-мойщика окон", path: "/rent/robot-moyshchik-okon" },
    {
      name: "Аренда моющего пылесоса",
      path: "/rent/moyushchiy-pylesos-dlya-mebeli",
    },
    { name: "Игровые приставки", path: "/catalog/igrovye-pristavki" },
    { name: "Уборка", path: "/catalog/uborka" },
    { name: "Зона доставки", path: "/delivery-area" },
  ],
};

const categoryPages = SEO_CATEGORIES.map((category) => ({
  path: `/catalog/${category.slug}` as SeoRoute,
  title:
    category.slug === "uborka"
      ? "Техника для уборки в аренду в Москве | ПРОКАТило"
      : "Игровые приставки в аренду в Москве | ПРОКАТило",
  description: category.metaDescription,
  h1: `${category.title} в аренду`,
  eyebrow: "Категория",
  intro: category.description,
  updatedAt: SEO_UPDATED_AT,
  changeFrequency: "weekly" as const,
  priority: 0.85,
  breadcrumbs: [
    { name: "Главная", path: "/" as SeoRoute },
    { name: "Каталог", path: "/catalog" as SeoRoute },
    { name: category.title, path: `/catalog/${category.slug}` as SeoRoute },
  ],
  ctaLabel: "Открыть приложение",
  ctaHref: "/app",
  jsonLdType: "category" as const,
  sections: [
    {
      title: "Для каких задач подходит",
      body: category.description,
      items: SEO_CATALOG_ITEMS.filter(
        (item) => item.categorySlug === category.slug,
      ).map((item) => item.title),
    },
  ],
  relatedLinks: SEO_CATALOG_ITEMS.filter(
    (item) => item.categorySlug === category.slug,
  ).map((item) => ({
    name: item.title,
    path: `/rent/${item.slug}` as SeoRoute,
  })),
})) satisfies SeoPageConfig[];

const itemPages = SEO_CATALOG_ITEMS.map((item) => ({
  path: `/rent/${item.slug}` as SeoRoute,
  title:
    item.slug === "ps5"
      ? "Аренда PS5 на вечер и сутки в Москве | ПРОКАТило"
      : item.slug === "playstation-vr"
        ? "Аренда PlayStation VR в Москве | ПРОКАТило"
        : item.slug === "robot-moyshchik-okon"
          ? "Аренда робота-мойщика окон в Москве | ПРОКАТило"
          : "Аренда моющего пылесоса для мебели | ПРОКАТило",
  description: item.metaDescription,
  h1: `${item.title} в аренду`,
  eyebrow: item.categoryTitle,
  intro: item.description,
  updatedAt: SEO_UPDATED_AT,
  changeFrequency: "weekly" as const,
  priority: 0.9,
  breadcrumbs: [
    { name: "Главная", path: "/" as SeoRoute },
    { name: "Каталог", path: "/catalog" as SeoRoute },
    {
      name: item.categoryTitle,
      path: `/catalog/${item.categorySlug}` as SeoRoute,
    },
    { name: item.title, path: `/rent/${item.slug}` as SeoRoute },
  ],
  image: item.image,
  imageAlt: item.imageAlt,
  ctaLabel: "Забронировать в приложении",
  ctaHref: "/app",
  secondaryCtaLabel: "Посмотреть зону доставки",
  secondaryCtaHref: "/delivery-area" as SeoRoute,
  jsonLdType: "item" as const,
  catalogItem: item,
  sections: [
    {
      title: "Когда удобно арендовать",
      body: "Берите вещь для конкретной задачи и возвращайте после использования. Это помогает не покупать редкую технику и не хранить ее дома.",
      items: item.bestFor,
    },
    {
      title: "Как проходит бронь",
      body: "Вы выбираете вещь и срок в приложении, оператор подтверждает детали, а курьер помогает с доставкой в зоне обслуживания.",
    },
  ],
  faqs: item.faqs,
  relatedLinks: [
    {
      name: item.categoryTitle,
      path: `/catalog/${item.categorySlug}` as SeoRoute,
    },
    { name: "Зона доставки", path: "/delivery-area" as SeoRoute },
    { name: "FAQ", path: "/faq" as SeoRoute },
    ...(item.slug === "ps5"
      ? [
          {
            name: "Как устроить вечер с PS5",
            path: "/blog/arenda-ps5-na-vecher" as SeoRoute,
          },
        ]
      : []),
    ...(item.slug === "robot-moyshchik-okon"
      ? [
          {
            name: "Когда брать робота-мойщика",
            path: "/blog/robot-moyshchik-okon-arenda" as SeoRoute,
          },
        ]
      : []),
    ...(item.slug === "moyushchiy-pylesos-dlya-mebeli"
      ? [
          {
            name: "Как почистить диван дома",
            path: "/blog/kak-pochistit-divan-doma" as SeoRoute,
          },
        ]
      : []),
  ],
})) satisfies SeoPageConfig[];

const deliveryAreaPage: SeoPageConfig = {
  path: "/delivery-area",
  title: "Доставка аренды техники по западу Москвы | ПРОКАТило",
  description:
    "Доставка аренды техники по Очаково-Матвеевскому, Раменкам, Никулино, Солнцево и соседним районам. Условия зависят от адреса и маршрута.",
  h1: "Зона доставки и обслуживания",
  eyebrow: "Доставка",
  intro:
    "Мы строим сервис вокруг локального удобства: техника рядом с домом, понятный интервал и оператор, который подтверждает детали.",
  updatedAt: SEO_UPDATED_AT,
  changeFrequency: "monthly",
  priority: 0.85,
  breadcrumbs: [
    { name: "Главная", path: "/" },
    { name: "Зона доставки", path: "/delivery-area" },
  ],
  ctaLabel: "Открыть каталог",
  ctaHref: "/catalog",
  jsonLdType: "area",
  sections: [
    {
      title: "Основная зона доставки",
      body: "В первую очередь работаем вокруг Очаково-Матвеевского и ближайших районов на западе Москвы.",
      items: [
        "Очаково-Матвеевское",
        "ЖК Мичуринский парк",
        "Раменки",
        "Никулино",
        "Солнцево",
        "соседние районы по согласованию с оператором",
      ],
    },
    {
      title: "Стоимость доставки",
      body: "Для ближайших адресов доставка может быть бесплатной. Для остальных адресов стоимость зависит от маршрута и подтверждается оператором до финального согласования заказа.",
    },
    {
      title: "Если адрес вне зоны",
      body: "Оставьте заявку в приложении или свяжитесь с оператором. Мы проверим адрес и заранее скажем, сможем ли привезти вещь и сколько будет стоить доставка.",
    },
    {
      title: "Возврат",
      body: "Перед окончанием аренды оператор свяжется с вами и уточнит удобное время возврата. Курьер заберет вещь и проверит комплектность.",
    },
  ],
};

const faqPage: SeoPageConfig = {
  path: "/faq",
  title: "Вопросы об аренде вещей и доставке | ПРОКАТило",
  description:
    "Ответы на частые вопросы о бронировании вещей, сроках аренды, доставке, оплате курьеру и возврате техники в локальном сервисе ПРОКАТило.",
  h1: "Вопросы и ответы",
  eyebrow: "FAQ",
  intro:
    "Собрали главное о том, как устроена аренда вещей рядом с домом: от выбора срока до возврата.",
  updatedAt: SEO_UPDATED_AT,
  changeFrequency: "monthly",
  priority: 0.75,
  breadcrumbs: [
    { name: "Главная", path: "/" },
    { name: "FAQ", path: "/faq" },
  ],
  ctaLabel: "Перейти в приложение",
  ctaHref: "/app",
  jsonLdType: "faq",
  sections: [
    {
      title: "Коротко о процессе",
      body: "Вы выбираете вещь, срок и адрес, оператор подтверждает бронь, а курьер привозит заказ в выбранный интервал.",
    },
  ],
  faqs: [
    ...SEO_HOME_FAQS,
    {
      question: "Можно взять вещь на неделю?",
      answer:
        "Да, для части вещей доступны короткий, суточный и недельный сценарии. Конкретные условия видны в приложении.",
    },
    {
      question: "Что делать, если адрес за пределами основной зоны?",
      answer:
        "Оставьте бронь, а оператор уточнит возможность и стоимость доставки по маршруту.",
    },
  ],
};

const aboutPage: SeoPageConfig = {
  path: "/about",
  title: "О сервисе аренды вещей ПРОКАТило в Москве",
  description:
    "ПРОКАТило — локальный B2C-сервис аренды вещей на западе Москвы. Техника для редких задач без лишних покупок, хранения и хлама дома.",
  h1: "О ПРОКАТило",
  eyebrow: "О сервисе",
  intro:
    "Мы делаем аренду вещей простой и теплой: выбрали, попользовались, вернули. Для редких задач и разумного потребления.",
  updatedAt: SEO_UPDATED_AT,
  changeFrequency: "monthly",
  priority: 0.7,
  breadcrumbs: [
    { name: "Главная", path: "/" },
    { name: "О сервисе", path: "/about" },
  ],
  ctaLabel: "Посмотреть каталог",
  ctaHref: "/catalog",
  jsonLdType: "about",
  sections: [
    {
      title: "Почему это удобно",
      body: "Не каждая вещь должна жить дома постоянно. Иногда достаточно взять ее на вечер, сутки или неделю.",
    },
    {
      title: "Как мы позиционируем сервис",
      body: "ПРОКАТило — централизованный B2C-сервис с оператором, поддержкой и зоной обслуживания, а не маркетплейс объявлений.",
    },
  ],
};

const blogPage: SeoPageConfig = {
  path: "/blog",
  title: "Блог об аренде вещей и техники | ПРОКАТило",
  description:
    "Практичные статьи об аренде техники, домашней уборке и разумном потреблении: когда вещь выгоднее взять на время, чем покупать и хранить.",
  h1: "Блог о разумной аренде",
  eyebrow: "Блог",
  intro:
    "Пишем о бытовых сценариях, где вещь нужна ненадолго: для вечера, уборки или проверки идеи без покупки.",
  updatedAt: SEO_UPDATED_AT,
  changeFrequency: "monthly",
  priority: 0.7,
  breadcrumbs: [
    { name: "Главная", path: "/" },
    { name: "Блог", path: "/blog" },
  ],
  ctaLabel: "Открыть каталог",
  ctaHref: "/catalog",
  jsonLdType: "blog",
  sections: SEO_BLOG_POSTS.map((post) => ({
    title: post.h1,
    body: post.description,
  })),
  relatedLinks: SEO_BLOG_POSTS.map((post) => ({
    name: post.title,
    path: `/blog/${post.slug}` as SeoRoute,
  })),
};

const blogPostPages = SEO_BLOG_POSTS.map((post) => ({
  path: `/blog/${post.slug}` as SeoRoute,
  title:
    post.slug === "arenda-ili-pokupka-tehniki"
      ? "Аренда или покупка техники: как выбрать | ПРОКАТило"
      : post.slug === "arenda-ps5-na-vecher"
        ? "Аренда PS5 на вечер: идеи и советы | ПРОКАТило"
        : post.slug === "kak-pochistit-divan-doma"
          ? "Как почистить диван моющим пылесосом | ПРОКАТило"
          : "Робот-мойщик окон в аренду: когда брать | ПРОКАТило",
  description: post.metaDescription,
  h1: post.h1,
  eyebrow: "Блог",
  intro: post.intro,
  updatedAt: SEO_UPDATED_AT,
  changeFrequency: "monthly" as const,
  priority: 0.65,
  breadcrumbs: [
    { name: "Главная", path: "/" as SeoRoute },
    { name: "Блог", path: "/blog" as SeoRoute },
    { name: post.h1, path: `/blog/${post.slug}` as SeoRoute },
  ],
  ctaLabel: "Посмотреть вещи в аренду",
  ctaHref: "/catalog" as SeoRoute,
  jsonLdType: "article" as const,
  sections: post.sections,
  relatedLinks: [
    { name: "Каталог", path: "/catalog" as SeoRoute },
    { name: "FAQ", path: "/faq" as SeoRoute },
  ],
})) satisfies SeoPageConfig[];

export const SEO_PAGES: SeoPageConfig[] = [
  homePage,
  catalogPage,
  ...categoryPages,
  ...itemPages,
  deliveryAreaPage,
  faqPage,
  aboutPage,
  blogPage,
  ...blogPostPages,
];

export const SEO_PAGE_BY_PATH = new Map<SeoRoute, SeoPageConfig>(
  SEO_PAGES.map((page) => [page.path, page]),
);

export function getSeoPage(path: SeoRoute) {
  return SEO_PAGE_BY_PATH.get(path);
}
