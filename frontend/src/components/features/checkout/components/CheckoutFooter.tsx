import { AppButton } from "@/components/ui/AppButton";
import { BRAND_GRADIENT } from "@/lib/brand";

function getStepButtonLabel(step: number, requiresAuth: boolean) {
  switch (step) {
    case 1:
      return "Далее";
    case 2:
      return "Далее";
    case 3:
      return "Всё верно";
    default:
      return requiresAuth ? "Войти для брони" : "Забронировать";
  }
}

export function CheckoutFooter({
  step,
  isSubmitting,
  requiresAuth,
  summaryLabel,
  summaryValue,
  disabled,
  onBack,
  onNext,
}: {
  step: number;
  isSubmitting: boolean;
  requiresAuth: boolean;
  summaryLabel: string;
  summaryValue: string;
  disabled: boolean;
  onBack: () => void;
  onNext: () => void;
}) {
  return (
    <footer
      data-testid="checkout-action-dock"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white pb-[max(0.75rem,env(safe-area-inset-bottom))]"
    >
      <div className="mx-auto grid max-w-2xl gap-3 pl-[max(1rem,env(safe-area-inset-left))] pr-[max(1rem,env(safe-area-inset-right))] pt-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center sm:px-6 sm:py-4">
        <div className="grid min-w-0 grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-1 sm:block sm:px-0">
          <p className="min-w-0 truncate text-sm font-bold text-slate-500">
            {summaryLabel}
          </p>
          <p className="max-w-40 text-right text-sm font-black leading-snug tabular-nums text-slate-950 sm:mt-0.5 sm:max-w-none sm:text-left sm:text-base">
            {summaryValue}
          </p>
        </div>

        <div className="flex gap-3">
          <div className="hidden sm:block">
            <AppButton
              type="button"
              onClick={onBack}
              variant="secondary"
              className="min-w-32 focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2"
            >
              Назад
            </AppButton>
          </div>
          <AppButton
            type="button"
            onClick={onNext}
            disabled={disabled}
            aria-busy={isSubmitting}
            data-testid="checkout-primary-action"
            className={`w-full min-w-0 focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 sm:min-w-48 ${BRAND_GRADIENT} shadow-rose-200`}
          >
            {isSubmitting
              ? "Бронируем…"
              : getStepButtonLabel(step, requiresAuth)}
          </AppButton>
        </div>
      </div>
    </footer>
  );
}
