import { useId } from "react";
import { CalendarDays } from "lucide-react";

export function DatePickerButton({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const inputId = useId();

  return (
    <label
      htmlFor={inputId}
      className="relative flex shrink-0 cursor-pointer items-center gap-2 rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 text-base font-black text-slate-700"
    >
      <CalendarDays size={16} />
      <span>Календарь</span>
      <input
        id={inputId}
        type="date"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="absolute inset-0 cursor-pointer opacity-0"
        aria-label="Выбрать дату"
      />
    </label>
  );
}
