import type { LucideIcon } from "lucide-react";

export function PanelLabel({
  icon: Icon,
  label,
}: {
  icon: LucideIcon;
  label: string;
}) {
  return (
    <p className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-500">
      <Icon size={15} />
      {label}
    </p>
  );
}
