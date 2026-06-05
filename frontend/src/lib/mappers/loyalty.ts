import type {
  AppLoyaltySummary,
  AppLoyaltyTransaction,
  BackendLoyaltySummaryDto,
  BackendLoyaltyTransactionDto,
} from "@/types";

export function mapBackendLoyaltyTransactionToAppLoyaltyTransaction(
  dto: BackendLoyaltyTransactionDto,
): AppLoyaltyTransaction {
  return {
    id: dto.id,
    type: dto.type,
    amount: Number(dto.amount),
    description: dto.description,
    orderId: dto.order_id,
    promoCodeId: dto.promo_code_id,
    createdAt: dto.created_at,
  };
}

export function mapBackendLoyaltySummaryToAppLoyaltySummary(
  dto: BackendLoyaltySummaryDto,
): AppLoyaltySummary {
  return {
    account: {
      balance: Number(dto.account.balance),
      lifetimeEarned: Number(dto.account.lifetime_earned),
      lifetimeSpent: Number(dto.account.lifetime_spent),
    },
    recentTransactions: dto.recent_transactions.map(
      mapBackendLoyaltyTransactionToAppLoyaltyTransaction,
    ),
    cashbackPercent: dto.cashback_percent,
    bonusToRubleRate: dto.bonus_to_ruble_rate,
    maxBonusSpendPercent: dto.max_bonus_spend_percent,
  };
}
