import type { HTMLAttributes } from "react";

type AppBadgeTone = "default" | "success" | "warning" | "danger" | "dark";

interface AppBadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: AppBadgeTone;
}

const BADGE_TONES: Record<AppBadgeTone, string> = {
  default: "bg-slate-100 text-slate-600",
  success: "bg-emerald-100 text-emerald-700",
  warning: "bg-amber-100 text-amber-700",
  danger: "bg-rose-100 text-rose-700",
  dark: "bg-slate-950 text-white",
};

export function AppBadge({
  tone = "default",
  className = "",
  children,
  ...props
}: AppBadgeProps) {
  return (
    <span
      className={`inline-flex items-center justify-center gap-1.5 rounded-full px-3 py-1.5 text-center text-xs font-black leading-snug ${BADGE_TONES[tone]} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
}
