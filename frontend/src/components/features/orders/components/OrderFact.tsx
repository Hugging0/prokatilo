import type { LucideIcon } from "lucide-react";

export function OrderFact({
  icon: Icon,
  label,
  value,
  hint,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <Icon className="mt-0.5 shrink-0 text-slate-400" size={19} />
      <div>
        <p className="text-sm font-extrabold text-slate-500">{label}</p>
        <p className="mt-1 text-base font-bold leading-relaxed text-slate-800">
          {value}
        </p>
        {hint && (
          <p className="mt-1 text-sm font-bold leading-relaxed text-slate-400">
            {hint}
          </p>
        )}
      </div>
    </div>
  );
}
