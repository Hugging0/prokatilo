import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

interface AppEmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  action?: ReactNode;
  dark?: boolean;
}

export function AppEmptyState({
  icon: Icon,
  title,
  description,
  action,
  dark = false,
}: AppEmptyStateProps) {
  return (
    <section
      className={`rounded-[1.75rem] border px-6 py-10 text-center shadow-sm ${
        dark
          ? "border-white/10 bg-white/5 text-white"
          : "border-slate-100 bg-white text-slate-950"
      }`}
    >
      {Icon && (
        <div
          className={`mx-auto flex size-20 items-center justify-center rounded-[1.5rem] ${
            dark ? "bg-white/10 text-white/40" : "bg-slate-50 text-slate-300"
          }`}
        >
          <Icon size={38} />
        </div>
      )}
      <h2 className="mt-6 text-2xl font-black tracking-tight">{title}</h2>
      <p
        className={`mx-auto mt-3 max-w-xs text-base font-bold leading-relaxed ${
          dark ? "text-white/55" : "text-slate-500"
        }`}
      >
        {description}
      </p>
      {action && <div className="mt-6">{action}</div>}
    </section>
  );
}
