import Link from "next/link";
import { ChevronRight } from "lucide-react";

import { SeoSiteFooter, SeoSiteHeader } from "@/components/seo/SeoSiteChrome";

interface LegalPageProps {
  title: string;
  text: string;
  description?: string;
}

type LegalBlock =
  | { type: "heading"; level: 1 | 2 | 3; content: string }
  | { type: "paragraph"; content: string[] }
  | { type: "list"; items: string[] };

function cleanHeading(line: string) {
  return line.replace(/^#{1,3}\s*/, "").trim();
}

function isListItem(line: string) {
  return /^(\d+\.\s+|-\s+)/.test(line);
}

function cleanListItem(line: string) {
  return line.replace(/^(\d+\.\s+|-\s+)/, "").trim();
}

function parseLegalText(text: string): LegalBlock[] {
  const blocks: LegalBlock[] = [];
  const paragraph: string[] = [];
  let listItems: string[] = [];

  const flushParagraph = () => {
    if (paragraph.length > 0) {
      blocks.push({ type: "paragraph", content: [...paragraph] });
      paragraph.length = 0;
    }
  };

  const flushList = () => {
    if (listItems.length > 0) {
      blocks.push({ type: "list", items: [...listItems] });
      listItems = [];
    }
  };

  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.trim();

    if (!line) {
      flushParagraph();
      flushList();
      continue;
    }

    if (/^Дата (публикации|редакции):/i.test(line)) {
      continue;
    }

    if (line.startsWith("### ")) {
      flushParagraph();
      flushList();
      blocks.push({ type: "heading", level: 3, content: cleanHeading(line) });
      continue;
    }

    if (line.startsWith("## ")) {
      flushParagraph();
      flushList();
      blocks.push({ type: "heading", level: 2, content: cleanHeading(line) });
      continue;
    }

    if (line.startsWith("# ")) {
      flushParagraph();
      flushList();
      blocks.push({ type: "heading", level: 1, content: cleanHeading(line) });
      continue;
    }

    if (isListItem(line)) {
      flushParagraph();
      listItems.push(cleanListItem(line));
      continue;
    }

    flushList();
    paragraph.push(line);
  }

  flushParagraph();
  flushList();

  return blocks;
}

function getDocumentDate(text: string) {
  const updatedMatch = text.match(/Дата редакции:\s*(.+)/);
  if (updatedMatch?.[1]) {
    return { label: "Дата редакции", value: updatedMatch[1].trim() };
  }

  const publishedMatch = text.match(/Дата публикации:\s*(.+)/);
  if (publishedMatch?.[1]) {
    return { label: "Дата публикации", value: publishedMatch[1].trim() };
  }

  return null;
}

export function LegalPage({
  title,
  text,
  description,
}: LegalPageProps) {
  const blocks = parseLegalText(text);
  const documentDate = getDocumentDate(text);

  return (
    <main className="min-h-screen bg-white text-slate-950">
      <SeoSiteHeader />
      <header className="border-b border-slate-100 bg-slate-50">
        <div className="mx-auto max-w-4xl px-5 py-12 sm:py-16">
          <nav aria-label="Хлебные крошки" className="flex items-center gap-1.5 text-sm font-bold text-slate-500">
            <Link href="/" className="transition hover:text-slate-950">Главная</Link>
            <ChevronRight size={14} className="text-slate-300" />
            <span className="truncate text-slate-700">{title}</span>
          </nav>
          <p className="mt-8 text-sm font-black uppercase text-orange-700">Документы и информация</p>
          <h1 className="mt-3 text-4xl font-black leading-[1.08] text-slate-950 sm:text-5xl">
            {title}
          </h1>
          {description && (
            <p className="mt-5 max-w-2xl text-lg font-semibold leading-relaxed text-slate-600">
              {description}
            </p>
          )}
          {documentDate && (
            <p className="mt-6 text-sm font-extrabold text-slate-400">
              {documentDate.label}: {documentDate.value}
            </p>
          )}
        </div>
      </header>

      <article className="mx-auto max-w-4xl px-5 py-12 sm:py-16">
        <div className="max-w-3xl space-y-5">
          {blocks.map((block, index) => {
            if (block.type === "heading") {
              const isPrimaryHeading = index === 0 && block.level === 1;

              if (isPrimaryHeading) {
                return null;
              }

              const headingClass =
                block.level === 2
                  ? "pt-7 text-2xl font-black leading-snug text-slate-950"
                  : "pt-3 text-lg font-black leading-snug text-slate-900";

              return (
                <h2 key={`${block.content}-${index}`} className={headingClass}>
                  {block.content}
                </h2>
              );
            }

            if (block.type === "list") {
              return (
                <ul
                  key={`list-${index}`}
                  className="space-y-2 pl-5 text-base font-bold leading-relaxed text-slate-600"
                >
                  {block.items.map((item) => (
                    <li key={item} className="list-disc marker:text-orange-500">
                      {item}
                    </li>
                  ))}
                </ul>
              );
            }

            return (
              <p
                key={`paragraph-${index}`}
                className="text-base font-bold leading-relaxed text-slate-600"
              >
                {block.content.map((line, lineIndex) => (
                  <span key={line}>
                    {lineIndex > 0 && <br />}
                    {line}
                  </span>
                ))}
              </p>
            );
          })}
        </div>
      </article>
      <SeoSiteFooter />
    </main>
  );
}
