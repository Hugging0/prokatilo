import { useId, useRef } from "react";
import { CalendarDays } from "lucide-react";

export function DatePickerButton({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);

  const openDatePicker = () => {
    const input = inputRef.current;

    if (!input) {
      return;
    }

    input.focus();

    try {
      input.showPicker();
      return;
    } catch {
      input.click();
    }
  };

  return (
    <div className="relative shrink-0">
      <button
        type="button"
        onClick={openDatePicker}
        aria-controls={inputId}
        className="flex items-center gap-2 rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 text-base font-black text-slate-700 transition hover:bg-white active:scale-95"
      >
        <CalendarDays size={16} />
        <span>Календарь</span>
      </button>
      <input
        ref={inputRef}
        id={inputId}
        type="date"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="pointer-events-none absolute inset-x-0 bottom-0 h-px w-px opacity-0"
        aria-label="Выбрать дату"
      />
    </div>
  );
}
