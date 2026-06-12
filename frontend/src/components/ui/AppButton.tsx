import type { ButtonHTMLAttributes } from "react";

type AppButtonVariant = "primary" | "secondary" | "danger" | "ghost";
type AppButtonSize = "md" | "sm";

interface AppButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: AppButtonVariant;
  size?: AppButtonSize;
  fullWidth?: boolean;
}

const BUTTON_VARIANTS: Record<AppButtonVariant, string> = {
  primary:
    "bg-gradient-to-br from-amber-400 via-orange-500 to-rose-600 text-white shadow-lg shadow-rose-100",
  secondary:
    "border border-slate-200 bg-white text-slate-700 shadow-sm",
  danger: "border border-rose-100 bg-rose-50 text-rose-700 shadow-sm",
  ghost: "bg-transparent text-slate-600",
};

const BUTTON_SIZES: Record<AppButtonSize, string> = {
  md: "min-h-14 rounded-2xl px-5 text-base",
  sm: "min-h-11 rounded-xl px-3 py-2 text-xs",
};

export function AppButton({
  variant = "primary",
  size = "md",
  fullWidth = false,
  className = "",
  children,
  ...props
}: AppButtonProps) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 font-black transition active:scale-95 disabled:pointer-events-none disabled:opacity-50 ${
        BUTTON_VARIANTS[variant]
      } ${BUTTON_SIZES[size]} ${fullWidth ? "w-full" : ""} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
