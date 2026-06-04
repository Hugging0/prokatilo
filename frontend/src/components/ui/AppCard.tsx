import type { HTMLAttributes } from "react";

type AppCardVariant = "default" | "compact" | "hero" | "dark";

interface AppCardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: AppCardVariant;
}

const CARD_VARIANTS: Record<AppCardVariant, string> = {
  default: "rounded-[1.75rem] border border-slate-100 bg-white p-5 shadow-sm",
  compact: "rounded-[1.5rem] border border-slate-100 bg-white p-4 shadow-sm",
  hero: "rounded-[2rem] border border-slate-100 bg-white p-6 shadow-sm",
  dark: "rounded-[1.75rem] border border-white/10 bg-white/10 p-5 shadow-sm",
};

export function AppCard({
  variant = "default",
  className = "",
  children,
  ...props
}: AppCardProps) {
  return (
    <div className={`${CARD_VARIANTS[variant]} ${className}`} {...props}>
      {children}
    </div>
  );
}
