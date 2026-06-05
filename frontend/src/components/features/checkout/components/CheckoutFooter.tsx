import { AppButton } from "@/components/ui/AppButton";
import { BRAND_GRADIENT } from "@/lib/brand";

function getStepButtonLabel(step: number) {
  switch (step) {
    case 1:
      return "Далее: адрес";
    case 2:
      return "Далее: проверить";
    case 3:
      return "Далее";
    default:
      return "Создать бронь";
  }
}

export function CheckoutFooter({
  step,
  isSubmitting,
  disabled,
  onBack,
  onNext,
}: {
  step: number;
  isSubmitting: boolean;
  disabled: boolean;
  onBack: () => void;
  onNext: () => void;
}) {
  return (
    <footer className="mx-auto mt-8 flex max-w-2xl gap-3 px-6">
      <AppButton type="button" onClick={onBack} variant="secondary" className="flex-1">
        Назад
      </AppButton>
      <AppButton
        type="button"
        onClick={onNext}
        disabled={disabled}
        className={`flex-[1.4] ${BRAND_GRADIENT} shadow-rose-200`}
      >
        {isSubmitting ? "Создаём бронь…" : getStepButtonLabel(step)}
      </AppButton>
    </footer>
  );
}
