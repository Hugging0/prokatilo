import { Bell, CreditCard, ShieldCheck, Star, User as UserIcon } from "lucide-react";

import { AppBadge } from "@/components/ui/AppBadge";
import { AppButton } from "@/components/ui/AppButton";
import { AppCard } from "@/components/ui/AppCard";
import { AppInfoRow } from "@/components/ui/AppInfoRow";
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
    label: "Оплата",
    val: "Курьеру при получении",
  },
  {
    icon: Bell,
    label: "Уведомления",
    val: "Вкл",
  },
];

interface ProfileViewProps {
  user: User;
  onLogout: () => void;
}

export function ProfileView({
  user,
  onLogout,
}: ProfileViewProps) {
  return (
    <main className="min-h-screen bg-slate-50 px-5 pt-10 pb-32">
      <div className="mx-auto flex max-w-2xl flex-col gap-5">
      <AppCard variant="hero">
        <div
          className={`mb-5 flex size-20 items-center justify-center rounded-[2rem] ${BRAND_GRADIENT} text-white shadow-xl shadow-rose-200`}
        >
          <UserIcon size={34} />
        </div>

        <h1 className="text-3xl font-black leading-tight tracking-tight text-slate-950">
          {user.name}
        </h1>
        <p className="mt-2 text-base font-bold leading-relaxed text-slate-500">
          {user.email}
        </p>
        <p className="mt-1 text-sm font-bold leading-relaxed text-slate-500">
          {user.phone ? user.phone : "Телефон не указан"}
        </p>
      </AppCard>

      <AppCard className="flex items-center justify-between gap-4">
        <AppInfoRow
          icon={ShieldCheck}
          label="Аккаунт"
          value={
            user.isAdmin
              ? UI_COPY.profile.adminAccountTitle
              : UI_COPY.profile.customerAccountTitle
          }
          hint={
            user.isAdmin
              ? UI_COPY.profile.adminAccountHint
              : UI_COPY.profile.customerAccountHint
          }
        />
        <AppBadge tone={user.isAdmin ? "dark" : "default"}>
          {user.isAdmin ? "Админ" : "Клиент"}
        </AppBadge>
      </AppCard>

      <div className="flex flex-col gap-3">
        {PROFILE_STATS.map((item) => (
          <AppCard
            key={item.label}
            variant="compact"
            className="flex items-center justify-between gap-4"
          >
            <AppInfoRow icon={item.icon} label={item.label} value={item.val} />
          </AppCard>
        ))}
      </div>

      <AppButton
        type="button"
        onClick={onLogout}
        variant="ghost"
        fullWidth
        className="text-slate-400 hover:text-rose-500"
      >
        Выйти
      </AppButton>
      </div>
    </main>
  );
}
