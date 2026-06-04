import type { ReactNode } from "react";

interface AppSectionHeaderProps {
  title: string;
  meta?: ReactNode;
  dark?: boolean;
}

export function AppSectionHeader({
  title,
  meta,
  dark = false,
}: AppSectionHeaderProps) {
  return (
    <div className="flex items-center justify-between gap-3">
      <h2
        className={`text-lg font-black tracking-tight ${
          dark ? "text-white" : "text-slate-950"
        }`}
      >
        {title}
      </h2>
      {meta}
    </div>
  );
}
