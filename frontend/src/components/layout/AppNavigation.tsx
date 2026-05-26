import {
  Home,
  Info,
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
  onBonusClick: () => void;
}

export function AppNavigation({
  view,
  isAdmin,
  onNavigate,
  onBonusClick,
}: AppNavigationProps) {
  const activeClass = `${BRAND_GRADIENT} text-white shadow-lg`;

  return (
    <nav className="fixed bottom-4 left-1/2 z-40 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 rounded-[2rem] border border-slate-100 bg-white/95 p-2 shadow-2xl shadow-slate-300 backdrop-blur">
      <div className="grid grid-cols-4 gap-1">
        <button
          type="button"
          onClick={() => onNavigate("home")}
          className={`flex flex-col items-center gap-1 rounded-3xl py-3 text-[10px] font-black ${
            view === "home" ? activeClass : "text-slate-400"
          }`}
        >
          <Home size={20} />
          Главная
        </button>

        <button
          type="button"
          onClick={() => onNavigate("orders")}
          className={`flex flex-col items-center gap-1 rounded-3xl py-3 text-[10px] font-black ${
            view === "orders" ? activeClass : "text-slate-400"
          }`}
        >
          <Package size={20} />
          Брони
        </button>

        {isAdmin ? (
          <button
            type="button"
            onClick={() => onNavigate("admin-dashboard")}
            className={`flex flex-col items-center gap-1 rounded-3xl py-3 text-[10px] font-black ${
              view === "admin-dashboard"
                ? activeClass
                : "text-slate-400"
            }`}
          >
            <LayoutDashboard size={20} />
            {UI_COPY.operator.navLabel}
          </button>
        ) : (
          <button
            type="button"
            onClick={onBonusClick}
            className="flex flex-col items-center gap-1 rounded-3xl py-3 text-[10px] font-black text-slate-400"
          >
            <Info size={20} />
            Бонусы
          </button>
        )}

        <button
          type="button"
          onClick={() => onNavigate("profile")}
          className={`flex flex-col items-center gap-1 rounded-3xl py-3 text-[10px] font-black ${
            view === "profile" ? activeClass : "text-slate-400"
          }`}
        >
          <UserIcon size={20} />
          Профиль
        </button>
      </div>
    </nav>
  );
}
