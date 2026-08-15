import type { SeoFaqItem } from "@/lib/seo/site";

export function SeoFaqList({ faqs }: { faqs: SeoFaqItem[] }) {
  return (
    <div className="border-t border-slate-200">
      {faqs.map((faq) => (
        <details key={faq.question} className="group border-b border-slate-200 py-5">
          <summary className="cursor-pointer list-none text-lg font-black text-slate-950 marker:hidden">
            <span className="flex items-start justify-between gap-5">
              {faq.question}
              <span className="text-2xl font-semibold leading-none text-orange-600 transition group-open:rotate-45">+</span>
            </span>
          </summary>
          <p className="max-w-2xl pt-3 text-base font-semibold leading-relaxed text-slate-600">{faq.answer}</p>
        </details>
      ))}
    </div>
  );
}
