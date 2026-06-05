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
    <div className="flex items-center justify-between gap-4 border-b border-slate-100 py-3 last:border-b-0">
      <span className="text-base font-bold text-slate-500">{label}</span>
      <span
        className={`text-base ${
          strong ? "font-black text-slate-900" : "font-bold text-slate-700"
        }`}
      >
        {value}
      </span>
    </div>
  );
}
