import type { LucideIcon } from "lucide-react";

interface AppInfoRowProps {
  icon: LucideIcon;
  label: string;
  value: string;
  hint?: string;
  dark?: boolean;
}

export function AppInfoRow({
  icon: Icon,
  label,
  value,
  hint,
  dark = false,
}: AppInfoRowProps) {
  return (
    <div className="flex items-start gap-4">
      <div
        className={`flex size-10 shrink-0 items-center justify-center rounded-2xl ${
          dark ? "bg-white/10 text-white/60" : "bg-slate-50 text-slate-500"
        }`}
      >
        <Icon size={19} />
      </div>
      <div>
        <p
          className={`text-sm font-extrabold ${
            dark ? "text-white/50" : "text-slate-500"
          }`}
        >
          {label}
        </p>
        <p
          className={`mt-1 text-base font-black leading-relaxed ${
            dark ? "text-white" : "text-slate-900"
          }`}
        >
          {value}
        </p>
        {hint && (
          <p
            className={`mt-1 text-sm font-bold leading-relaxed ${
              dark ? "text-white/50" : "text-slate-500"
            }`}
          >
            {hint}
          </p>
        )}
      </div>
    </div>
  );
}
