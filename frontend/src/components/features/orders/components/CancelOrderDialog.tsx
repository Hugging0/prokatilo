import { AppButton } from "@/components/ui/AppButton";
import { AppCard } from "@/components/ui/AppCard";
import { AppNotice } from "@/components/ui/AppNotice";
import { UI_COPY } from "@/lib/copy";

export function CancelOrderDialog({
  error,
  isSubmitting,
  onClose,
  onConfirm,
}: {
  error: string | null;
  isSubmitting: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/40 px-5 pb-5 backdrop-blur-sm sm:items-center sm:pb-0">
      <button
        type="button"
        className="absolute inset-0"
        onClick={onClose}
        aria-label="Закрыть"
      />
      <AppCard className="relative w-full max-w-2xl">
        <h2 className="text-lg font-black tracking-tight text-slate-950">
          Отменить бронь?
        </h2>
        <p className="mt-2 text-base font-bold leading-relaxed text-slate-500">
          Бронь будет отменена, а выбранное время освободится для других клиентов.
        </p>
        {error && (
          <AppNotice tone="danger" className="mt-4 px-4 py-3">
            {error || UI_COPY.toast.orderCancelError}
          </AppNotice>
        )}
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <AppButton
            type="button"
            variant="secondary"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Не отменять
          </AppButton>
          <AppButton
            type="button"
            variant="danger"
            onClick={() => void onConfirm()}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Отменяем…" : "Отменить бронь"}
          </AppButton>
        </div>
      </AppCard>
    </div>
  );
}
