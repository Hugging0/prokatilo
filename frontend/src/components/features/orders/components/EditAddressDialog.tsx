import { useState, type ReactNode } from "react";

import { AppButton } from "@/components/ui/AppButton";
import { AppCard } from "@/components/ui/AppCard";
import { AppNotice } from "@/components/ui/AppNotice";
import { UI_COPY } from "@/lib/copy";

export function EditAddressDialog({
  initialAddress,
  error,
  isSubmitting,
  onClose,
  onSubmit,
}: {
  initialAddress: string;
  error: string | null;
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (address: string) => Promise<void>;
}) {
  const [address, setAddress] = useState(initialAddress);
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleSubmit = async () => {
    const nextAddress = address.trim();

    if (nextAddress.length < 5) {
      setValidationError("Введите адрес не короче 5 символов.");
      return;
    }

    setValidationError(null);
    await onSubmit(nextAddress);
  };

  return (
    <DialogShell onClose={onClose}>
      <AppCard className="w-full">
        <h2 className="text-lg font-black tracking-tight text-slate-950">
          Изменить адрес доставки
        </h2>
        <p className="mt-2 text-base font-bold leading-relaxed text-slate-500">
          Адрес можно изменить до передачи заказа курьеру.
        </p>
        <textarea
          value={address}
          onChange={(event) => setAddress(event.target.value)}
          rows={4}
          className="mt-5 w-full resize-none rounded-2xl border border-slate-100 bg-slate-50 px-4 py-4 text-base font-bold text-slate-700 outline-none transition focus:border-slate-300"
          placeholder="Улица, дом, подъезд, квартира"
        />
        {(validationError || error) && (
          <AppNotice tone="danger" className="mt-4 px-4 py-3">
            {validationError || error || UI_COPY.toast.addressUpdateError}
          </AppNotice>
        )}
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <AppButton
            type="button"
            variant="secondary"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Отмена
          </AppButton>
          <AppButton
            type="button"
            onClick={() => void handleSubmit()}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Сохраняем…" : "Сохранить адрес"}
          </AppButton>
        </div>
      </AppCard>
    </DialogShell>
  );
}

function DialogShell({
  children,
  onClose,
}: {
  children: ReactNode;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/40 px-5 pb-5 backdrop-blur-sm sm:items-center sm:pb-0">
      <button
        type="button"
        className="absolute inset-0"
        onClick={onClose}
        aria-label="Закрыть"
      />
      <div className="relative w-full max-w-2xl">{children}</div>
    </div>
  );
}
