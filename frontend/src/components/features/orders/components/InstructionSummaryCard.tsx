import { BookOpen, ChevronRight } from "lucide-react";

import { AppButton } from "@/components/ui/AppButton";
import { AppCard } from "@/components/ui/AppCard";
import type { ItemInstruction } from "@/types";

export function InstructionSummaryCard({
  instruction,
  onOpen,
}: {
  instruction: ItemInstruction;
  onOpen: () => void;
}) {
  const stepCount = instruction.sections.reduce(
    (total, section) => total + section.steps.length,
    0,
  );

  return (
    <AppCard className="overflow-hidden border-orange-100 bg-gradient-to-br from-orange-50 via-white to-rose-50">
      <div className="flex items-center gap-3 text-orange-700">
        <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-orange-100">
          <BookOpen size={21} />
        </span>
        <span className="text-sm font-black uppercase">
          Полезно перед первым запуском
        </span>
      </div>

      <h2 className="mt-5 text-2xl font-black leading-tight text-slate-950">
        {instruction.title}
      </h2>
      <p className="mt-3 text-base font-bold leading-relaxed text-slate-600">
        {instruction.intro}
      </p>

      <div className="mt-4 flex flex-wrap gap-2">
        <span className="rounded-full border border-orange-200 bg-white px-3 py-1.5 text-xs font-black text-orange-700">
          {stepCount} шагов
        </span>
        {instruction.return_checklist.length > 0 && (
          <span className="rounded-full border border-orange-200 bg-white px-3 py-1.5 text-xs font-black text-orange-700">
            Перед возвратом
          </span>
        )}
      </div>

      <AppButton type="button" fullWidth className="mt-5" onClick={onOpen}>
        Открыть инструкцию
        <ChevronRight size={19} />
      </AppButton>
    </AppCard>
  );
}
