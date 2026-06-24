import type { LucideIcon } from "lucide-react";

export type TariffType = "3h" | "24h" | "7d";

export type OrderStatus =
  | "pending"
  | "confirmed"
  | "delivery"
  | "active"
  | "returned"
  | "cancelled";

export type PaymentMethod = "sbp" | "card" | "cash";

export type PaymentStatus =
  | "pending"
  | "waiting_for_capture"
  | "succeeded"
  | "canceled"
  | "not_required";

export type AppView =
  | "auth"
  | "home"
  | "details"
  | "checkout"
  | "orders"
  | "bonuses"
  | "profile"
  | "admin-dashboard";

export type PromoCodeKind =
  | "percent_discount"
  | "fixed_discount"
  | "bonus_credit";

export type LoyaltyTransactionType =
  | "earned"
  | "spent"
  | "promo_credit"
  | "refund"
  | "adjustment";

export interface User {
  id: number;
  name: string;
  email: string;
  phone: string;
  isAdmin: boolean;
}

export interface AppItem {
  id: number;
  title: string;
  desc: string;
  price3h: number;
  price24h: number;
  price7d: number;
  icon: LucideIcon;
  color: string;
  border: string;
  bg: string;
  category: string;
  available: boolean;
  active: boolean;
  iconKey: string;
  imageUrl: string | null;
  sortOrder: number;
}

export interface Review {
  rating: number;
  comment: string;
}

export interface AppOrder {
  id: number;
  itemId: number;
  title: string;
  icon: LucideIcon;
  color: string;
  bg: string;
  customerName: string;
  customerEmail: string | null;
  customerPhone: string;
  tariff: TariffType;
  date: string;
  time: string;
  rentalStartAt: string | null;
  rentalEndAt: string | null;
  subtotalPrice: number;
  promoDiscountAmount: number;
  bonusSpentAmount: number;
  bonusEarnedAmount: number;
  promoCode: AppPromoCode | null;
  price: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  paymentConfirmationUrl: string | null;
  providerPaymentId: string | null;
  deliveryAddress: string;
  status: OrderStatus;
  comment: string | null;
  createdAt: string;
  updatedAt: string;
  review: Review | null;
}

export interface BackendItemDto {
  id: number;
  title: string;
  description: string | null;
  category: string;
  price_per_3h: string;
  price_per_24h: string;
  price_per_7d: string;
  image_url: string | null;
  icon_key: string;
  sort_order: number;
  is_available: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface AdminItemFormPayload {
  title: string;
  description: string | null;
  category: string;
  price_per_3h: number;
  price_per_24h: number;
  price_per_7d: number;
  image_url: string | null;
  icon_key: string;
  sort_order: number;
  is_available: boolean;
  is_active: boolean;
}

export interface CatalogItemFormState {
  title: string;
  description: string;
  category: string;
  price_per_3h: string;
  price_per_24h: string;
  price_per_7d: string;
  image_url: string;
  icon_key: string;
  sort_order: string;
  is_available: boolean;
  is_active: boolean;
}

export interface BackendOrderDto {
  id: number;
  item_id: number;
  user_id: number | null;
  customer_login: string;
  customer_name: string;
  customer_email: string | null;
  customer_phone: string;
  delivery_address: string;
  payment_method: PaymentMethod;
  payment_status: PaymentStatus;
  yookassa_payment_id: string | null;
  yookassa_confirmation_url: string | null;
  tariff_type: TariffType;
  subtotal_price: string;
  promo_code: BackendPromoCodeDto | null;
  promo_discount_amount: string;
  bonus_spent_amount: string;
  bonus_earned_amount: string;
  total_price: string;
  status: OrderStatus;
  comment: string | null;
  rental_date: string;
  rental_time: string;
  rental_start_at: string | null;
  rental_end_at: string | null;
  created_at: string;
  updated_at: string;
  item: BackendItemDto;
}

export interface BackendBookingDto {
  order_id: number;
  item_id: number;
  rental_start_at: string;
  rental_end_at: string;
  status: OrderStatus;
}

export interface BackendDeliveryEstimateDto {
  kind: string;
  title: string;
  price_label: string;
  description: string;
  short_note: string;
  is_exact_free: boolean;
  needs_operator_confirmation: boolean;
  distance_m: number | null;
  matched_address: string | null;
}

export interface BookingSlot {
  orderId: number;
  itemId: number;
  rentalStartAt: string;
  rentalEndAt: string;
  status: OrderStatus;
}

export interface CreateOrderPayload {
  item_id: number;
  customer_name: string;
  customer_email?: string | null;
  customer_phone: string;
  delivery_address: string;
  payment_method: PaymentMethod;
  tariff_type: TariffType;
  total_price: number;
  rental_date: string;
  rental_time: string;
  rental_end_date?: string | null;
  rental_end_time?: string | null;
  promo_code?: string | null;
  bonus_spend_amount?: number | null;
  comment?: string | null;
}

export interface BackendLoyaltyAccountDto {
  balance: string;
  lifetime_earned: string;
  lifetime_spent: string;
}

export interface BackendLoyaltyTransactionDto {
  id: number;
  type: LoyaltyTransactionType;
  amount: string;
  description: string;
  order_id: number | null;
  promo_code_id: number | null;
  created_at: string;
}

export interface BackendLoyaltySummaryDto {
  account: BackendLoyaltyAccountDto;
  recent_transactions: BackendLoyaltyTransactionDto[];
  cashback_percent: number;
  bonus_to_ruble_rate: number;
  max_bonus_spend_percent: number;
}

export interface AppLoyaltyAccount {
  balance: number;
  lifetimeEarned: number;
  lifetimeSpent: number;
}

export interface AppLoyaltyTransaction {
  id: number;
  type: LoyaltyTransactionType;
  amount: number;
  description: string;
  orderId: number | null;
  promoCodeId: number | null;
  createdAt: string;
}

export interface AppLoyaltySummary {
  account: AppLoyaltyAccount;
  recentTransactions: AppLoyaltyTransaction[];
  cashbackPercent: number;
  bonusToRubleRate: number;
  maxBonusSpendPercent: number;
}

export interface BackendPromoCodeDto {
  id: number;
  code: string;
  title: string;
  description: string | null;
  kind: PromoCodeKind;
  discount_percent: string | null;
  discount_amount: string | null;
  bonus_amount: string | null;
  min_order_amount: string | null;
  max_uses: number | null;
  used_count: number;
  max_uses_per_user: number;
  valid_from: string | null;
  valid_until: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface AppPromoCode {
  id: number;
  code: string;
  title: string;
  description: string | null;
  kind: PromoCodeKind;
  discountPercent: number | null;
  discountAmount: number | null;
  bonusAmount: number | null;
  minOrderAmount: number | null;
  maxUses: number | null;
  usedCount: number;
  maxUsesPerUser: number;
  validFrom: string | null;
  validUntil: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface BackendPromoCodePreviewDto {
  code: string;
  title: string;
  description: string | null;
  kind: PromoCodeKind;
  discount_amount: string;
  bonus_amount: string;
  message: string;
}

export interface AppPromoCodePreview {
  code: string;
  title: string;
  description: string | null;
  kind: PromoCodeKind;
  discountAmount: number;
  bonusAmount: number;
  message: string;
}

export interface BackendPromoCodeActivateDto {
  balance: string;
  credited_amount: string;
  message: string;
}

export interface AdminPromoCodePayload {
  code: string;
  title: string;
  description: string | null;
  kind: PromoCodeKind;
  discount_percent: number | null;
  discount_amount: number | null;
  bonus_amount: number | null;
  min_order_amount: number | null;
  max_uses: number | null;
  max_uses_per_user: number;
  valid_from: string | null;
  valid_until: string | null;
  is_active: boolean;
}

export interface WebPushPublicKeyDto {
  public_key: string | null;
  is_configured: boolean;
}

export interface PushSubscriptionPayload {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

export interface BackendServiceSettingsDto {
  id: number;
  timezone: string;
  workday_start: string;
  workday_end: string;
  delivery_slot_minutes: number;
  min_order_lead_minutes: number;
  support_phone: string | null;
  service_is_active: boolean;
  service_pause_message: string | null;
  cash_enabled: boolean;
  card_enabled: boolean;
  sbp_enabled: boolean;
  default_payment_method: PaymentMethod;
  cashback_percent: number;
  max_bonus_spend_percent: number;
  bonus_to_ruble_rate: number;
  created_at: string;
  updated_at: string;
}

export interface AdminServiceSettingsPayload {
  timezone?: string;
  workday_start?: string;
  workday_end?: string;
  delivery_slot_minutes?: number;
  min_order_lead_minutes?: number;
  support_phone?: string | null;
  service_is_active?: boolean;
  service_pause_message?: string | null;
  cash_enabled?: boolean;
  card_enabled?: boolean;
  sbp_enabled?: boolean;
  default_payment_method?: PaymentMethod;
  cashback_percent?: number;
  max_bonus_spend_percent?: number;
  bonus_to_ruble_rate?: number;
}

export interface AdminOrderUpdatePayload {
  customer_name?: string;
  customer_email?: string | null;
  customer_phone?: string;
  delivery_address?: string;
  payment_method?: PaymentMethod;
  tariff_type?: TariffType;
  total_price?: number;
  rental_date?: string;
  rental_time?: string;
  rental_end_date?: string | null;
  rental_end_time?: string | null;
  comment?: string | null;
}

export interface BackendUserDto {
  id: number;
  email: string;
  name: string;
  phone: string | null;
  is_admin: boolean;
}

export interface AuthResponseDto {
  access_token: string;
  token_type: "bearer";
  user: BackendUserDto;
}

export interface AuthRegisterPayload {
  email: string;
  password: string;
  name: string;
  phone?: string | null;
}

export interface AuthLoginPayload {
  email: string;
  password: string;
}

export interface PaymentResponseDto {
  order_id: number;
  payment_status: PaymentStatus;
  provider_payment_id: string | null;
  confirmation_url: string | null;
}

export type Item = AppItem;
export type Order = AppOrder;
