import type { AppLoyaltyTransaction, LoyaltyTransactionType } from "@/types";

export function formatBonusAmount(amount: number): string {
  return `${Math.trunc(amount).toLocaleString("ru-RU")} ₽`;
}

export function getBonusTransactionTone(
  type: LoyaltyTransactionType,
): "positive" | "negative" | "neutral" {
  if (type === "earned" || type === "promo_credit" || type === "refund") {
    return "positive";
  }

  if (type === "spent") {
    return "negative";
  }

  return "neutral";
}

export function formatBonusTransactionAmount(
  transaction: AppLoyaltyTransaction,
): string {
  const tone = getBonusTransactionTone(transaction.type);
  const absAmount = Math.abs(transaction.amount);

  if (tone === "positive") {
    return `+${formatBonusAmount(absAmount)}`;
  }

  if (tone === "negative") {
    return `−${formatBonusAmount(absAmount)}`;
  }

  return formatBonusAmount(absAmount);
}

export function formatBonusDate(isoDate: string): string {
  return new Intl.DateTimeFormat("ru-RU", {
    day: "numeric",
    month: "long",
  }).format(new Date(isoDate));
}
