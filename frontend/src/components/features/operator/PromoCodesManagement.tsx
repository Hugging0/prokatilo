"use client";

import { RefreshCw } from "lucide-react";

import { AppButton } from "@/components/ui/AppButton";
import { AppEmptyState } from "@/components/ui/AppEmptyState";
import { AppNotice } from "@/components/ui/AppNotice";
import { UI_COPY } from "@/lib/copy";

import { PromoCodeCard } from "./components/PromoCodeCard";
import { PromoCodeForm } from "./components/PromoCodeForm";
import { useAdminPromoCodes } from "./hooks/use-admin-promo-codes";

export function PromoCodesManagement({ authToken }: { authToken: string }) {
  const promoCodes = useAdminPromoCodes(authToken);

  return (
    <section className="flex flex-col gap-5">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-lg font-black tracking-tight text-slate-950">
          {UI_COPY.operator.promoCodesTitle}
        </h3>
        <button
          type="button"
          onClick={() => void promoCodes.refresh()}
          className="inline-flex min-h-10 items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 text-xs font-black text-slate-500 shadow-sm"
        >
          <RefreshCw size={14} />
          Обновить
        </button>
      </div>

      <PromoCodeForm
        key={promoCodes.selectedPromoCode?.id ?? "new"}
        promoCode={promoCodes.selectedPromoCode}
        isSubmitting={promoCodes.isSubmitting}
        onSubmit={(payload) => void promoCodes.savePromoCode(payload)}
        onCancel={() => promoCodes.setSelectedPromoCode(null)}
      />

      {promoCodes.isLoading && (
        <AppNotice>
          Загружаем промокоды…
        </AppNotice>
      )}

      {promoCodes.message && (
        <AppNotice>
          {promoCodes.message}
        </AppNotice>
      )}

      <div className="flex flex-col gap-4">
        {promoCodes.promoCodes.map((promoCode) => (
          <PromoCodeCard
            key={promoCode.id}
            promoCode={promoCode}
            onEdit={() => promoCodes.setSelectedPromoCode(promoCode)}
            onArchive={() => void promoCodes.archivePromoCode(promoCode.id)}
          />
        ))}

        {!promoCodes.isLoading && promoCodes.promoCodes.length === 0 && (
          <AppEmptyState
            title={UI_COPY.operator.promoCodesEmpty}
            description="Создайте первый промокод для скидок или бонусов сервиса."
            action={
              <AppButton
                type="button"
                onClick={() => promoCodes.setSelectedPromoCode(null)}
              >
                {UI_COPY.operator.createPromoCode}
              </AppButton>
            }
          />
        )}
      </div>
    </section>
  );
}
