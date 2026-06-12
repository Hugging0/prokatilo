import { Bell, X } from "lucide-react";

import { AppButton } from "@/components/ui/AppButton";
import { AppCard } from "@/components/ui/AppCard";

interface PushNotificationPromptProps {
  isOpen: boolean;
  isLoading: boolean;
  onEnable: () => void;
  onClose: () => void;
}

export function PushNotificationPrompt({
  isOpen,
  isLoading,
  onEnable,
  onClose,
}: PushNotificationPromptProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end bg-slate-950/30 px-4 pb-6 pt-10 backdrop-blur-sm sm:items-center sm:justify-center">
      <AppCard className="mx-auto flex w-full max-w-md flex-col gap-4 shadow-xl">
        <div className="flex items-start justify-between gap-4">
          <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-orange-50 text-orange-600">
            <Bell size={22} />
          </span>
          <button
            type="button"
            onClick={onClose}
            className="flex min-h-11 min-w-11 items-center justify-center rounded-2xl bg-slate-50 text-slate-400"
            aria-label="Закрыть запрос уведомлений"
          >
            <X size={18} />
          </button>
        </div>

        <div>
          <h2 className="text-2xl font-black tracking-tight text-slate-950">
            Включите уведомления
          </h2>
          <p className="mt-2 text-base font-bold leading-relaxed text-slate-500">
            Сообщим о подтверждении брони, доставке и возврате, даже если приложение закрыто.
          </p>
        </div>

        <AppButton
          type="button"
          onClick={onEnable}
          disabled={isLoading}
          fullWidth
        >
          {isLoading ? "Включаем…" : "Включить уведомления"}
        </AppButton>
      </AppCard>
    </div>
  );
}
