import type { HTMLAttributes } from "react";

type AppNoticeTone = "default" | "danger" | "warning" | "dark";

interface AppNoticeProps extends HTMLAttributes<HTMLDivElement> {
  tone?: AppNoticeTone;
}

const NOTICE_TONES: Record<AppNoticeTone, string> = {
  default:
    "border-slate-100 bg-white text-slate-500",
  danger: "border-rose-100 bg-rose-50 text-rose-600",
  warning: "border-amber-100 bg-amber-50 text-amber-800",
  dark: "border-white/10 bg-white/10 text-white/60",
};

export function AppNotice({
  tone = "default",
  className = "",
  children,
  ...props
}: AppNoticeProps) {
  return (
    <div
      className={`rounded-[1.5rem] border p-5 text-base font-bold leading-relaxed shadow-sm ${NOTICE_TONES[tone]} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
