import { AppCard } from "@/components/ui/AppCard";
import { AppEmptyState } from "@/components/ui/AppEmptyState";
import { UI_COPY } from "@/lib/copy";
import type { AppLoyaltyTransaction } from "@/types";

import {
  formatBonusDate,
  formatBonusTransactionAmount,
  getBonusTransactionTone,
} from "../lib/bonus-formatters";

export function BonusTransactionsList({
  transactions,
}: {
  transactions: AppLoyaltyTransaction[];
}) {
  if (transactions.length === 0) {
    return (
      <AppEmptyState
        title={UI_COPY.bonus.emptyHistoryTitle}
        description={UI_COPY.bonus.emptyHistoryDescription}
      />
    );
  }

  return (
    <AppCard className="flex flex-col gap-4">
      <h2 className="text-lg font-black tracking-tight text-slate-950">
        {UI_COPY.bonus.historyTitle}
      </h2>
      <div className="flex flex-col divide-y divide-slate-100">
        {transactions.map((transaction) => {
          const tone = getBonusTransactionTone(transaction.type);

          return (
            <div
              key={transaction.id}
              className="flex items-center justify-between gap-4 py-4 first:pt-0 last:pb-0"
            >
              <div>
                <p className="text-base font-black leading-snug text-slate-950">
                  {transaction.description}
                </p>
                <p className="mt-1 text-sm font-bold leading-relaxed text-slate-500">
                  {formatBonusDate(transaction.createdAt)}
                </p>
              </div>
              <p
                className={`shrink-0 text-base font-black ${
                  tone === "positive"
                    ? "text-emerald-600"
                    : tone === "negative"
                      ? "text-rose-600"
                      : "text-slate-600"
                }`}
              >
                {formatBonusTransactionAmount(transaction)}
              </p>
            </div>
          );
        })}
      </div>
    </AppCard>
  );
}
