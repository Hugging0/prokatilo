"use client";

import { RefreshCw } from "lucide-react";

import { AppButton } from "@/components/ui/AppButton";
import { AppNotice } from "@/components/ui/AppNotice";
import { UI_COPY } from "@/lib/copy";

import { BonusBalanceCard } from "./components/BonusBalanceCard";
import { BonusRulesCard } from "./components/BonusRulesCard";
import { BonusTransactionsList } from "./components/BonusTransactionsList";
import { PromoCodeActivationCard } from "./components/PromoCodeActivationCard";
import { useLoyalty } from "./hooks/use-loyalty";

interface BonusesViewProps {
  authToken: string;
  onNotify: (message: string) => void;
}

export function BonusesView({ authToken, onNotify }: BonusesViewProps) {
  const loyalty = useLoyalty({ authToken, onNotify });

  return (
    <main className="min-h-screen bg-slate-50 px-5 pt-10 pb-32">
      <div className="mx-auto flex max-w-2xl flex-col gap-5">
        {loyalty.isLoading && <AppNotice>{UI_COPY.bonus.loading}</AppNotice>}

        {loyalty.error && (
          <AppNotice tone="danger">
            <span>{loyalty.error}</span>
            <AppButton
              type="button"
              variant="secondary"
              onClick={() => void loyalty.refresh()}
              className="mt-4"
            >
              <RefreshCw size={18} />
              Обновить
            </AppButton>
          </AppNotice>
        )}

        {loyalty.summary && (
          <>
            <BonusBalanceCard balance={loyalty.summary.account.balance} />
            <PromoCodeActivationCard
              promoCode={loyalty.promoCode}
              isActivating={loyalty.isActivating}
              onPromoCodeChange={loyalty.setPromoCode}
              onActivate={() => void loyalty.activatePromoCode()}
            />
            <BonusRulesCard />
            <BonusTransactionsList
              transactions={loyalty.summary.recentTransactions}
            />
          </>
        )}
      </div>
    </main>
  );
}
