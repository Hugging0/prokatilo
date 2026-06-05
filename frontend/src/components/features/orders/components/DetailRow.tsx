import type { LucideIcon } from "lucide-react";

export function DetailRow({
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
    <div className="flex items-start gap-4">
      <div className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-slate-50 text-slate-500">
        <Icon size={19} />
      </div>
      <div>
        <p className="text-sm font-extrabold text-slate-500">{label}</p>
        <p className="mt-1 text-base font-black leading-relaxed text-slate-900">
          {value}
        </p>
        {hint && (
          <p className="mt-1 text-sm font-bold leading-relaxed text-slate-500">
            {hint}
          </p>
        )}
      </div>
    </div>
  );
}
