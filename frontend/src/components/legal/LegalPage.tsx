import Link from "next/link";

import { APP_NAME } from "@/lib/brand";

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

function getPublishedAt(text: string) {
  const match = text.match(/Дата публикации:\s*(.+)/);
  return match?.[1]?.trim() ?? null;
}

export function LegalPage({
  title,
  text,
  description,
}: LegalPageProps) {
  const blocks = parseLegalText(text);
  const publishedAt = getPublishedAt(text);

  return (
    <main className="min-h-screen bg-slate-50 px-5 py-8 sm:py-12">
      <article className="mx-auto max-w-3xl rounded-[2rem] border border-slate-100 bg-white p-6 shadow-xl shadow-slate-200/70 sm:p-10">
        <Link
          href="/"
          className="text-sm font-black uppercase tracking-wide text-orange-600"
        >
          {APP_NAME}
        </Link>

        <header className="mt-5 border-b border-slate-100 pb-6">
          <h1 className="text-3xl font-black leading-tight tracking-tight text-slate-950 sm:text-4xl">
            {title}
          </h1>
          {description && (
            <p className="mt-3 text-base font-bold leading-relaxed text-slate-500">
              {description}
            </p>
          )}
          {publishedAt && (
            <p className="mt-4 text-sm font-extrabold text-slate-400">
              Дата публикации: {publishedAt}
            </p>
          )}
        </header>

        <div className="mt-7 space-y-5">
          {blocks.map((block, index) => {
            if (block.type === "heading") {
              const isPrimaryHeading = index === 0 && block.level === 1;

              if (isPrimaryHeading) {
                return null;
              }

              const headingClass =
                block.level === 2
                  ? "pt-4 text-xl font-black leading-snug tracking-tight text-slate-950"
                  : "pt-2 text-lg font-black leading-snug tracking-tight text-slate-900";

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
    </main>
  );
}
