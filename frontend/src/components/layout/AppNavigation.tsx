import {
  Gift,
  Home,
  LayoutDashboard,
  Package,
  User as UserIcon,
} from "lucide-react";

import { BRAND_GRADIENT } from "@/lib/brand";
import { UI_COPY } from "@/lib/copy";
import type { AppView } from "@/types";

interface AppNavigationProps {
  view: AppView;
  isAdmin: boolean;
  onNavigate: (view: AppView) => void;
}

export function AppNavigation({
  view,
  isAdmin,
  onNavigate,
}: AppNavigationProps) {
  const activeClass = `${BRAND_GRADIENT} text-white shadow-lg`;
  const itemClass =
    "flex min-h-[3.25rem] flex-col items-center justify-center gap-0.5 rounded-[1.35rem] py-2 text-xs font-black transition active:scale-95";
  const inactiveClass = "text-slate-400 hover:bg-slate-50 hover:text-slate-600";

  return (
    <nav className="fixed inset-x-5 bottom-[calc(0.875rem+env(safe-area-inset-bottom))] z-40 mx-auto max-w-[25rem] rounded-[1.75rem] border border-slate-100 bg-white/95 p-1.5 shadow-xl shadow-slate-300/70 backdrop-blur">
      <div className="grid grid-cols-4 gap-1">
        <button
          type="button"
          onClick={() => onNavigate("home")}
          className={`${itemClass} ${
            view === "home" ? activeClass : inactiveClass
          }`}
        >
          <Home size={18} />
          Главная
        </button>

        <button
          type="button"
          onClick={() => onNavigate("orders")}
          className={`${itemClass} ${
            view === "orders" ? activeClass : inactiveClass
          }`}
        >
          <Package size={18} />
          Брони
        </button>

        {isAdmin ? (
          <button
            type="button"
            onClick={() => onNavigate("admin-dashboard")}
            className={`${itemClass} ${
              view === "admin-dashboard"
                ? activeClass
                : inactiveClass
            }`}
          >
            <LayoutDashboard size={18} />
            {UI_COPY.operator.navLabel}
          </button>
        ) : (
          <button
            type="button"
            onClick={() => onNavigate("bonuses")}
            className={`${itemClass} ${
              view === "bonuses" ? activeClass : inactiveClass
            }`}
          >
            <Gift size={18} />
            Бонусы
          </button>
        )}

        <button
          type="button"
          onClick={() => onNavigate("profile")}
          className={`${itemClass} ${
            view === "profile" ? activeClass : inactiveClass
          }`}
        >
          <UserIcon size={18} />
          Профиль
        </button>
      </div>
    </nav>
  );
}
