export function SummaryRow({
  label,
  value,
  strong = false,
}: {
  label: string;
  value: string;
  strong?: boolean;
}) {
  return (
    <div className="flex items-start gap-3 border-b border-slate-100 py-3 last:border-b-0">
      <span className="min-w-0 flex-1 text-base font-bold leading-snug text-slate-500">
        {label}
      </span>

      <span
        className={`ml-auto max-w-[55%] min-w-0 whitespace-normal break-words text-right text-base leading-snug ${
          strong ? "font-black text-slate-900" : "font-bold text-slate-700"
        }`}
      >
        {value}
      </span>
    </div>
  );
}
