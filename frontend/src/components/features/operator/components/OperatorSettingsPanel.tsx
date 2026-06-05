import { Clock3, CreditCard, Phone, Settings } from "lucide-react";

import { AppBadge } from "@/components/ui/AppBadge";
import { AppCard } from "@/components/ui/AppCard";
import { AppInfoRow } from "@/components/ui/AppInfoRow";

export function OperatorSettingsPanel() {
  return (
    <AppCard variant="dark" className="flex flex-col gap-5">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-black tracking-tight text-white">
            Настройки сервиса
          </h3>
          <p className="mt-1 text-sm font-bold leading-relaxed text-white/50">
            Сейчас это справка по текущему режиму MVP.
          </p>
        </div>
        <AppBadge className="bg-white/10 text-white">Read-only</AppBadge>
      </div>
      <AppInfoRow
        dark
        icon={CreditCard}
        label="Режим оплаты"
        value="Курьеру при получении"
        hint="Онлайн-оплата в клиентском интерфейсе отключена"
      />
      <AppInfoRow
        dark
        icon={Clock3}
        label="Интервалы доставки"
        value="08:00–20:00"
        hint="Выбор идет двухчасовыми окнами"
      />
      <AppInfoRow
        dark
        icon={Settings}
        label="Часовой пояс"
        value="Europe/Moscow"
        hint="Все даты и слоты показываются в московском времени"
      />
      <AppInfoRow
        dark
        icon={Phone}
        label="Поддержка"
        value="Связь с клиентом вручную"
        hint="Трекинг доставки пока не реализован"
      />
    </AppCard>
  );
}
