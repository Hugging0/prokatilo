import {
  Bell,
  CreditCard,
  Settings,
  Star,
  User as UserIcon,
} from "lucide-react";

import { BRAND_GRADIENT } from "@/lib/brand";
import { UI_COPY } from "@/lib/copy";
import type { User } from "@/types";

const PROFILE_STATS = [
  {
    icon: Star,
    label: "Отзывы",
    val: "4.9 ⭐",
  },
  {
    icon: CreditCard,
    label: "Платежи",
    val: "Привязаны",
  },
  {
    icon: Bell,
    label: "Уведомления",
    val: "Вкл",
  },
];

interface ProfileViewProps {
  user: User;
  isAdmin: boolean;
  onToggleAdmin: () => void;
  onLogout: () => void;
}

export function ProfileView({
  user,
  isAdmin,
  onToggleAdmin,
  onLogout,
}: ProfileViewProps) {
  return (
    <main className="min-h-screen bg-slate-50 px-6 pt-12 pb-32">
      <section className="bg-white rounded-[2rem] p-6 border border-slate-100 shadow-sm">
        <div
          className={`w-20 h-20 rounded-[2rem] ${BRAND_GRADIENT} text-white flex items-center justify-center mb-5 shadow-xl shadow-rose-200`}
        >
          <UserIcon size={34} />
        </div>

        <h2 className="text-3xl font-black text-slate-900 tracking-tighter leading-none">
          {user.name}
        </h2>
        <p className="text-slate-400 font-bold mt-2">{user.phone}</p>
      </section>

      <button
        type="button"
        onClick={onToggleAdmin}
        className={`mt-5 w-full p-5 rounded-[2rem] flex justify-between items-center cursor-pointer transition-all border-2 ${
          isAdmin
            ? "bg-rose-50 border-rose-200"
            : "bg-white border-slate-50 shadow-sm"
        }`}
      >
        <span className="flex items-center gap-3 font-black text-slate-900">
          <Settings size={20} />
          <span>
            <span className="block">
              {UI_COPY.profile.operatorModeTitle}
            </span>
            <span className="block text-[10px] font-bold text-slate-400 mt-1">
              {UI_COPY.profile.operatorModeHint}
            </span>
          </span>
        </span>

        <span
          className={`text-xs font-black ${
            isAdmin ? "text-rose-500" : "text-slate-400"
          }`}
        >
          {isAdmin
            ? UI_COPY.profile.enabled
            : UI_COPY.profile.disabled}
        </span>
      </button>

      <div className="mt-5 space-y-3">
        {PROFILE_STATS.map((item) => (
          <div
            key={item.label}
            className="bg-white rounded-[1.5rem] p-5 flex items-center justify-between border border-slate-100"
          >
            <span className="flex items-center gap-3 font-black text-slate-900">
              <item.icon size={20} className="text-slate-400" />
              {item.label}
            </span>
            <span className="text-sm font-black text-slate-400">
              {item.val}
            </span>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={onLogout}
        className="mt-12 w-full text-slate-300 text-[10px] font-black uppercase tracking-widest hover:text-rose-500 transition-colors py-4"
      >
        Выйти
      </button>
    </main>
  );
}
