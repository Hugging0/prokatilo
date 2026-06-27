import {
  BUSINESS_ADDRESS,
  BUSINESS_EMAIL,
  BUSINESS_PHONE_DISPLAY,
  BUSINESS_TELEGRAM_URL,
} from "@/lib/business";
import { SEO_PAGES } from "./pages";
import { SEO_SITE_DESCRIPTION, SEO_SITE_NAME, SEO_SITE_URL } from "./site";

function absoluteUrl(path: string) {
  return new URL(path, SEO_SITE_URL).toString();
}

export function renderLlmsIndex() {
  const primaryPages = SEO_PAGES.filter((page) =>
    [
      "/",
      "/catalog",
      "/delivery-area",
      "/faq",
      "/about",
      "/blog",
    ].includes(page.path),
  );

  const productPages = SEO_PAGES.filter((page) => page.path.startsWith("/rent/"));

  return [
    `# ${SEO_SITE_NAME}`,
    "",
    `> ${SEO_SITE_DESCRIPTION}`,
    "",
    "ПРОКАТило — централизованный B2C-сервис аренды вещей и техники на западе Москвы. Бронирование подтверждает оператор, доставку выполняет курьер, оплата производится курьеру при получении.",
    "",
    "## Основные страницы",
    ...primaryPages.map(
      (page) => `- [${page.h1}](${absoluteUrl(page.path)}): ${page.description}`,
    ),
    "",
    "## Вещи в аренду",
    ...productPages.map(
      (page) => `- [${page.h1}](${absoluteUrl(page.path)}): ${page.description}`,
    ),
    "",
    "## Контакты и правила",
    `- Адрес: ${BUSINESS_ADDRESS}`,
    `- Телефон: ${BUSINESS_PHONE_DISPLAY}`,
    `- Email: ${BUSINESS_EMAIL}`,
    `- Telegram: ${BUSINESS_TELEGRAM_URL}`,
    `- [Контакты](${absoluteUrl("/contacts")})`,
    `- [Пользовательское соглашение](${absoluteUrl("/terms")})`,
    `- [Политика обработки персональных данных](${absoluteUrl("/privacy")})`,
    "",
    `Полное описание индексируемых страниц: ${absoluteUrl("/llms-full.txt")}`,
  ].join("\n");
}

export function renderLlmsFull() {
  const pages = SEO_PAGES.flatMap((page) => {
    const sections = page.sections.flatMap((section) => [
      `### ${section.title}`,
      section.body,
      ...("items" in section && section.items
        ? section.items.map((item) => `- ${item}`)
        : []),
      "",
    ]);
    const faqs = page.faqs?.flatMap((faq) => [
      `### ${faq.question}`,
      faq.answer,
      "",
    ]) ?? [];

    return [
      `## ${page.h1}`,
      `URL: ${absoluteUrl(page.path)}`,
      page.intro,
      "",
      ...sections,
      ...(faqs.length ? ["### Частые вопросы", "", ...faqs] : []),
    ];
  });

  return [renderLlmsIndex(), "", "# Полное содержание", "", ...pages].join(
    "\n",
  );
}
