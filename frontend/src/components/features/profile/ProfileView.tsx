"use client";

import { useState } from "react";
import {
  Bell,
  ChevronRight,
  FileText,
  Headphones,
  Mail,
  Phone,
  ShieldCheck,
  User as UserIcon,
} from "lucide-react";
import Link from "next/link";

import { AppBadge } from "@/components/ui/AppBadge";
import { AppButton } from "@/components/ui/AppButton";
import { AppCard } from "@/components/ui/AppCard";
import { BRAND_GRADIENT } from "@/lib/brand";
import { BUSINESS_EMAIL } from "@/lib/business";
import { UI_COPY } from "@/lib/copy";
import {
  disablePushNotifications,
  enablePushNotifications,
  getPushNotificationPermission,
  type PushNotificationStatus,
} from "@/lib/push-notifications";
import type { User } from "@/types";

const LEGAL_LINKS = [
  { href: "/contacts", label: "Контакты" },
  { href: "/terms", label: "Пользовательское соглашение" },
  { href: "/privacy", label: "Политика персональных данных" },
  { href: "/consent", label: "Согласие на обработку данных" },
  { href: "/delivery-payment", label: "Доставка и оплата" },
];

interface ProfileViewProps {
  user: User;
  authToken: string;
  onLogout: () => void;
  onNotify: (message: string) => void;
}

function InfoLine({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl bg-slate-50 px-4 py-3">
      <p className="text-xs font-black uppercase tracking-wide text-slate-400">
        {label}
      </p>
      <p className="mt-1 break-words text-base font-black leading-snug text-slate-950">
        {value}
      </p>
    </div>
  );
}

export function ProfileView({
  user,
  authToken,
  onLogout,
  onNotify,
}: ProfileViewProps) {
  const [notificationStatus, setNotificationStatus] =
    useState<PushNotificationStatus>(() => getPushNotificationPermission());
  const [isNotificationSaving, setIsNotificationSaving] = useState(false);

  const isNotificationsEnabled = notificationStatus === "enabled";
  const notificationDescription =
    notificationStatus === "enabled"
      ? UI_COPY.profile.notificationsEnabled
      : notificationStatus === "denied"
        ? UI_COPY.profile.notificationsDenied
        : notificationStatus === "unsupported"
          ? UI_COPY.profile.notificationsUnsupported
          : UI_COPY.profile.notificationsDefault;

  const toggleNotifications = async () => {
    setIsNotificationSaving(true);
    const result = isNotificationsEnabled
      ? await disablePushNotifications(authToken)
      : await enablePushNotifications(authToken);

    setNotificationStatus(result.status);
    onNotify(result.message);
    setIsNotificationSaving(false);
  };

  return (
    <main className="min-h-screen bg-slate-50 px-5 pt-10 pb-[calc(8rem+env(safe-area-inset-bottom))]">
      <div className="mx-auto flex max-w-2xl flex-col gap-5">
        <AppCard variant="hero">
          <div className="flex items-start justify-between gap-4">
            <div
              className={`flex size-20 shrink-0 items-center justify-center rounded-[2rem] ${BRAND_GRADIENT} text-white shadow-xl shadow-rose-200`}
            >
              <UserIcon size={34} />
            </div>
            <AppBadge tone={user.isAdmin ? "dark" : "default"}>
              {user.isAdmin ? "Админ" : "Клиент"}
            </AppBadge>
          </div>

          <h1 className="mt-5 text-3xl font-black leading-tight tracking-tight text-slate-950">
            Аккаунт
          </h1>
          <p className="mt-2 text-base font-bold leading-relaxed text-slate-500">
            Контактные данные, поддержка и документы сервиса.
          </p>
        </AppCard>

        <AppCard>
          <div className="mb-4 flex items-center gap-3">
            <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-orange-50 text-orange-600">
              <ShieldCheck size={20} />
            </span>
            <div>
              <h2 className="text-xl font-black tracking-tight text-slate-950">
                Личные данные
              </h2>
              <p className="mt-1 text-sm font-bold leading-relaxed text-slate-500">
                Используются для связи по бронированиям.
              </p>
            </div>
          </div>

          <div className="grid gap-3">
            <InfoLine label="Имя" value={user.name || "Не указано"} />
            <InfoLine label="Email" value={user.email} />
            <InfoLine
              label="Телефон"
              value={user.phone ? user.phone : "Не указан"}
            />
          </div>
        </AppCard>

        <AppCard>
          <div className="mb-4 flex items-center gap-3">
            <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-orange-50 text-orange-600">
              <Headphones size={20} />
            </span>
            <div>
              <h2 className="text-xl font-black tracking-tight text-slate-950">
                Поддержка
              </h2>
              <p className="mt-1 text-sm font-bold leading-relaxed text-slate-500">
                Поможем с бронью, доставкой и возвратом.
              </p>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <a
              href={`mailto:${BUSINESS_EMAIL}`}
              className="inline-flex min-h-14 items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 text-base font-black text-slate-700 shadow-sm transition active:scale-95"
            >
              <Mail size={18} />
              Написать
            </a>
            <Link
              href="/contacts"
              className="inline-flex min-h-14 items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 text-base font-black text-slate-700 shadow-sm transition active:scale-95"
            >
              <Phone size={18} />
              Контакты
            </Link>
          </div>
        </AppCard>

        <AppCard className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-orange-50 text-orange-600">
              <Bell size={20} />
            </span>
            <div>
              <h2 className="text-lg font-black tracking-tight text-slate-950">
                {UI_COPY.profile.notificationsTitle}
              </h2>
              <p className="mt-1 text-sm font-bold leading-relaxed text-slate-500">
                {notificationDescription}
              </p>
            </div>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={isNotificationsEnabled}
            onClick={() => void toggleNotifications()}
            disabled={isNotificationSaving || notificationStatus === "unsupported"}
            className={`flex h-8 w-14 shrink-0 items-center rounded-full p-1 transition disabled:opacity-50 ${
              isNotificationsEnabled ? "bg-slate-900" : "bg-slate-200"
            }`}
          >
            <span
              className={`size-6 rounded-full bg-white shadow-sm transition ${
                isNotificationsEnabled ? "translate-x-6" : "translate-x-0"
              }`}
            />
          </button>
        </AppCard>

        <AppCard>
          <div className="mb-4 flex items-center gap-3">
            <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-orange-50 text-orange-600">
              <FileText size={20} />
            </span>
            <div>
              <h2 className="text-xl font-black tracking-tight text-slate-950">
                Правовая информация
              </h2>
              <p className="mt-1 text-sm font-bold leading-relaxed text-slate-500">
                Документы сервиса и условия аренды.
              </p>
            </div>
          </div>

          <nav className="divide-y divide-slate-100 overflow-hidden rounded-2xl border border-slate-100">
            {LEGAL_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="flex min-h-14 items-center justify-between gap-4 bg-white px-4 py-3 text-base font-black text-slate-700 transition hover:bg-slate-50"
              >
                {link.label}
                <ChevronRight size={18} className="shrink-0 text-slate-300" />
              </Link>
            ))}
          </nav>
        </AppCard>

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
