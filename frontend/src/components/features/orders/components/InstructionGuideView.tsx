import {
  AlertTriangle,
  ArrowLeft,
  BookOpen,
  Check,
  ExternalLink,
} from "lucide-react";

import { AppButton } from "@/components/ui/AppButton";
import { AppCard } from "@/components/ui/AppCard";
import type { ItemInstruction, PublicServiceSettingsDto } from "@/types";

import { SupportContactCard } from "./SupportContactCard";

export function InstructionGuideView({
  itemTitle,
  instruction,
  serviceSettings,
  onBack,
}: {
  itemTitle: string;
  instruction: ItemInstruction;
  serviceSettings: PublicServiceSettingsDto;
  onBack: () => void;
}) {
  const stepCount = instruction.sections.reduce(
    (total, section) => total + section.steps.length,
    0,
  );

  return (
    <main className="min-h-screen bg-slate-50 px-5 pt-8 pb-20">
      <div className="mx-auto flex max-w-2xl flex-col gap-5">
        <header className="flex items-center gap-4">
          <button
            type="button"
            onClick={onBack}
            className="grid size-12 shrink-0 place-items-center rounded-2xl border border-slate-100 bg-white text-slate-800 shadow-sm transition active:scale-95"
            aria-label="Назад к заказу"
          >
            <ArrowLeft size={21} />
          </button>
          <div className="min-w-0">
            <p className="truncate text-sm font-extrabold uppercase text-slate-400">
              {itemTitle}
            </p>
            <h1 className="mt-1 text-3xl font-black leading-tight text-slate-950">
              Инструкция
            </h1>
          </div>
        </header>

        <AppCard className="border-orange-100 bg-orange-50">
          <div className="flex items-start gap-4">
            <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-orange-500 text-white">
              <BookOpen size={23} />
            </span>
            <div className="min-w-0">
              <h2 className="text-2xl font-black leading-tight text-slate-950">
                {instruction.title}
              </h2>
              <p className="mt-2 text-base font-bold leading-relaxed text-slate-600">
                {instruction.intro}
              </p>
              <p className="mt-3 text-sm font-black text-orange-700">
                {stepCount} шагов · примерно {Math.max(2, Math.ceil(stepCount / 2))} мин
              </p>
            </div>
          </div>
        </AppCard>

        {instruction.sections.map((section, sectionIndex) => (
          <AppCard key={`${section.title}-${sectionIndex}`}>
            <h2 className="text-xl font-black text-slate-950">
              {section.title}
            </h2>
            <ol className="mt-4 divide-y divide-slate-100">
              {section.steps.map((step, stepIndex) => (
                <li
                  key={`${step.title}-${stepIndex}`}
                  className="flex gap-4 py-4 first:pt-0 last:pb-0"
                >
                  <span className="grid size-8 shrink-0 place-items-center rounded-full bg-orange-50 text-sm font-black text-orange-700">
                    {stepIndex + 1}
                  </span>
                  <div>
                    <h3 className="text-base font-black leading-snug text-slate-950">
                      {step.title}
                    </h3>
                    <p className="mt-1 text-sm font-bold leading-relaxed text-slate-600">
                      {step.text}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </AppCard>
        ))}

        {instruction.warning && (
          <section className="rounded-[1.75rem] border border-amber-200 bg-amber-50 p-5">
            <div className="flex items-start gap-4">
              <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-amber-100 text-amber-700">
                <AlertTriangle size={21} />
              </span>
              <div>
                <h2 className="text-lg font-black text-amber-950">Важно</h2>
                <p className="mt-2 text-sm font-bold leading-relaxed text-amber-900">
                  {instruction.warning}
                </p>
              </div>
            </div>
          </section>
        )}

        {instruction.return_checklist.length > 0 && (
          <AppCard>
            <h2 className="text-xl font-black text-slate-950">
              Перед возвратом
            </h2>
            <ul className="mt-4 flex flex-col gap-3">
              {instruction.return_checklist.map((item, index) => (
                <li key={`${item}-${index}`} className="flex items-start gap-3">
                  <span className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full bg-emerald-50 text-emerald-700">
                    <Check size={15} strokeWidth={3} />
                  </span>
                  <span className="text-sm font-bold leading-relaxed text-slate-700">
                    {item}
                  </span>
                </li>
              ))}
            </ul>
          </AppCard>
        )}

        {instruction.manual_url && (
          <AppButton
            type="button"
            variant="secondary"
            fullWidth
            onClick={() =>
              window.open(
                instruction.manual_url ?? undefined,
                "_blank",
                "noopener,noreferrer",
              )
            }
          >
            <ExternalLink size={19} />
            Официальное руководство
          </AppButton>
        )}

        <SupportContactCard
          supportPhone={serviceSettings.support_phone}
          supportTelegramUrl={serviceSettings.support_telegram_url}
        />
      </div>
    </main>
  );
}
