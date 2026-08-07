import {
  ArrowDown,
  ArrowUp,
  BookOpen,
  Plus,
  Trash2,
} from "lucide-react";

import { AppButton } from "@/components/ui/AppButton";
import type { ItemInstruction } from "@/types";

interface InstructionEditorProps {
  instruction: ItemInstruction;
  isPublished: boolean;
  onChange: (instruction: ItemInstruction) => void;
  onPublishedChange: (isPublished: boolean) => void;
}

const INPUT_CLASS =
  "min-h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-base font-bold text-slate-950 outline-none transition focus:border-orange-300 focus:ring-2 focus:ring-orange-100";

function IconButton({
  label,
  disabled = false,
  onClick,
  children,
}: {
  label: string;
  disabled?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className="grid size-10 shrink-0 place-items-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:border-orange-200 hover:text-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-200 disabled:cursor-not-allowed disabled:opacity-35"
    >
      {children}
    </button>
  );
}

export function InstructionEditor({
  instruction,
  isPublished,
  onChange,
  onPublishedChange,
}: InstructionEditorProps) {
  const updateSection = (
    sectionIndex: number,
    updater: (section: ItemInstruction["sections"][number]) => ItemInstruction["sections"][number],
  ) => {
    onChange({
      ...instruction,
      sections: instruction.sections.map((section, index) =>
        index === sectionIndex ? updater(section) : section,
      ),
    });
  };

  const moveSection = (sectionIndex: number, direction: -1 | 1) => {
    const targetIndex = sectionIndex + direction;
    if (targetIndex < 0 || targetIndex >= instruction.sections.length) return;

    const sections = [...instruction.sections];
    [sections[sectionIndex], sections[targetIndex]] = [
      sections[targetIndex],
      sections[sectionIndex],
    ];
    onChange({ ...instruction, sections });
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-start gap-3 rounded-2xl bg-orange-50 p-4 text-orange-950">
        <BookOpen size={22} className="mt-0.5 shrink-0 text-orange-600" />
        <div>
          <p className="font-black">Инструкция к товару</p>
          <p className="mt-1 text-sm font-bold leading-relaxed text-orange-800">
            Короткие действия для клиента, предупреждение и проверка комплекта.
          </p>
        </div>
      </div>

      <label className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-white p-4">
        <input
          type="checkbox"
          checked={isPublished}
          onChange={(event) => onPublishedChange(event.target.checked)}
          className="mt-1 size-4 accent-orange-600"
        />
        <span>
          <span className="block text-base font-black text-slate-950">
            Показывать клиентам
          </span>
          <span className="mt-1 block text-sm font-bold text-slate-500">
            Инструкция появится в подтвержденных и активных заказах.
          </span>
        </span>
      </label>

      <label className="text-sm font-black text-slate-700">
        Заголовок
        <input
          value={instruction.title}
          onChange={(event) =>
            onChange({ ...instruction, title: event.target.value })
          }
          className={`${INPUT_CLASS} mt-2`}
          placeholder="Как пользоваться PlayStation 5"
        />
      </label>

      <label className="text-sm font-black text-slate-700">
        Короткое описание
        <textarea
          value={instruction.intro}
          onChange={(event) =>
            onChange({ ...instruction, intro: event.target.value })
          }
          className={`${INPUT_CLASS} mt-2 min-h-24 py-3`}
          placeholder="Что клиент узнает из инструкции"
        />
      </label>

      <div className="flex flex-col gap-4">
        {instruction.sections.map((section, sectionIndex) => (
          <section
            key={`section-${sectionIndex}`}
            className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
          >
            <div className="flex items-center gap-2">
              <input
                value={section.title}
                onChange={(event) =>
                  updateSection(sectionIndex, (current) => ({
                    ...current,
                    title: event.target.value,
                  }))
                }
                className={INPUT_CLASS}
                aria-label={`Название раздела ${sectionIndex + 1}`}
                placeholder="Название раздела"
              />
              <IconButton
                label="Переместить раздел выше"
                disabled={sectionIndex === 0}
                onClick={() => moveSection(sectionIndex, -1)}
              >
                <ArrowUp size={17} />
              </IconButton>
              <IconButton
                label="Переместить раздел ниже"
                disabled={sectionIndex === instruction.sections.length - 1}
                onClick={() => moveSection(sectionIndex, 1)}
              >
                <ArrowDown size={17} />
              </IconButton>
              <IconButton
                label="Удалить раздел"
                disabled={instruction.sections.length === 1}
                onClick={() =>
                  onChange({
                    ...instruction,
                    sections: instruction.sections.filter(
                      (_, index) => index !== sectionIndex,
                    ),
                  })
                }
              >
                <Trash2 size={17} />
              </IconButton>
            </div>

            <div className="mt-4 flex flex-col gap-3">
              {section.steps.map((step, stepIndex) => (
                <div
                  key={`step-${sectionIndex}-${stepIndex}`}
                  className="rounded-2xl bg-white p-3"
                >
                  <div className="flex items-center gap-2">
                    <span className="grid size-8 shrink-0 place-items-center rounded-full bg-orange-100 text-sm font-black text-orange-700">
                      {stepIndex + 1}
                    </span>
                    <input
                      value={step.title}
                      onChange={(event) =>
                        updateSection(sectionIndex, (current) => ({
                          ...current,
                          steps: current.steps.map((currentStep, index) =>
                            index === stepIndex
                              ? { ...currentStep, title: event.target.value }
                              : currentStep,
                          ),
                        }))
                      }
                      className={INPUT_CLASS}
                      aria-label={`Название шага ${stepIndex + 1}`}
                      placeholder="Название шага"
                    />
                    <IconButton
                      label="Удалить шаг"
                      disabled={section.steps.length === 1}
                      onClick={() =>
                        updateSection(sectionIndex, (current) => ({
                          ...current,
                          steps: current.steps.filter(
                            (_, index) => index !== stepIndex,
                          ),
                        }))
                      }
                    >
                      <Trash2 size={17} />
                    </IconButton>
                  </div>
                  <textarea
                    value={step.text}
                    onChange={(event) =>
                      updateSection(sectionIndex, (current) => ({
                        ...current,
                        steps: current.steps.map((currentStep, index) =>
                          index === stepIndex
                            ? { ...currentStep, text: event.target.value }
                            : currentStep,
                        ),
                      }))
                    }
                    className={`${INPUT_CLASS} mt-3 min-h-24 py-3`}
                    aria-label={`Текст шага ${stepIndex + 1}`}
                    placeholder="Что именно нужно сделать"
                  />
                </div>
              ))}

              <AppButton
                type="button"
                variant="secondary"
                size="sm"
                onClick={() =>
                  updateSection(sectionIndex, (current) => ({
                    ...current,
                    steps: [...current.steps, { title: "", text: "" }],
                  }))
                }
              >
                <Plus size={17} />
                Добавить шаг
              </AppButton>
            </div>
          </section>
        ))}
      </div>

      <AppButton
        type="button"
        variant="secondary"
        onClick={() =>
          onChange({
            ...instruction,
            sections: [
              ...instruction.sections,
              {
                title: "Новый раздел",
                steps: [{ title: "", text: "" }],
              },
            ],
          })
        }
      >
        <Plus size={18} />
        Добавить раздел
      </AppButton>

      <label className="text-sm font-black text-slate-700">
        Важное предупреждение
        <textarea
          value={instruction.warning ?? ""}
          onChange={(event) =>
            onChange({
              ...instruction,
              warning: event.target.value || null,
            })
          }
          className={`${INPUT_CLASS} mt-2 min-h-24 py-3`}
          placeholder="Что нельзя делать и когда нужно остановиться"
        />
      </label>

      <div>
        <p className="text-sm font-black text-slate-700">Перед возвратом</p>
        <div className="mt-2 flex flex-col gap-2">
          {instruction.return_checklist.map((item, itemIndex) => (
            <div key={`check-${itemIndex}`} className="flex items-center gap-2">
              <input
                value={item}
                onChange={(event) =>
                  onChange({
                    ...instruction,
                    return_checklist: instruction.return_checklist.map(
                      (current, index) =>
                        index === itemIndex ? event.target.value : current,
                    ),
                  })
                }
                className={INPUT_CLASS}
                aria-label={`Пункт возврата ${itemIndex + 1}`}
                placeholder="Проверить комплект"
              />
              <IconButton
                label="Удалить пункт"
                onClick={() =>
                  onChange({
                    ...instruction,
                    return_checklist: instruction.return_checklist.filter(
                      (_, index) => index !== itemIndex,
                    ),
                  })
                }
              >
                <Trash2 size={17} />
              </IconButton>
            </div>
          ))}
        </div>
        <AppButton
          type="button"
          variant="secondary"
          size="sm"
          onClick={() =>
            onChange({
              ...instruction,
              return_checklist: [...instruction.return_checklist, ""],
            })
          }
          className="mt-3"
        >
          <Plus size={17} />
          Добавить пункт
        </AppButton>
      </div>

      <label className="text-sm font-black text-slate-700">
        Официальное руководство
        <input
          type="url"
          value={instruction.manual_url ?? ""}
          onChange={(event) =>
            onChange({
              ...instruction,
              manual_url: event.target.value || null,
            })
          }
          className={`${INPUT_CLASS} mt-2`}
          placeholder="https://..."
        />
      </label>
    </div>
  );
}
