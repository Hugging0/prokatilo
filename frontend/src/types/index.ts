import type { LucideIcon } from "lucide-react";

export type TariffType = "3h" | "6h" | "24h";

export type OrderStatus =
  | "pending"
  | "confirmed"
  | "delivery"
  | "active"
  | "returned"
  | "cancelled";

export type PaymentMethod = "sbp" | "card" | "cash";

export type AppView =
  | "auth"
  | "home"
  | "details"
  | "checkout"
  | "orders"
  | "profile"
  | "admin-dashboard";

export interface User {
  id: string;
  name: string;
  phone: string;
  isAdmin?: boolean;
}

export interface AppItem {
  id: number;
  title: string;
  desc: string;
  price3h: number;
  price6h: number;
  price24h: number;
  icon: LucideIcon;
  color: string;
  border: string;
  bg: string;
  category: string;
  available: boolean;
}

export interface Review {
  rating: number;
  comment: string;
}

export interface AppOrder {
  id: string;
  itemId: number;
  title: string;
  icon: LucideIcon;
  color: string;
  bg: string;
  userId: string;
  tariff: TariffType;
  date: string;
  time: string;
  price: number;
  status: OrderStatus;
  review: Review | null;
}

export interface BackendItemDto {
  id: number;
  title: string;
  description: string | null;
  price_per_3h: string;
  price_per_6h: string;
  price_per_24h: string;
  is_available: boolean;
  created_at: string;
}

export interface BackendOrderDto {
  id: number;
  item_id: number;
  customer_login: string;
  customer_phone: string;
  tariff_type: TariffType;
  total_price: string;
  status: OrderStatus;
  created_at: string;
}

export type Item = AppItem;
export type Order = AppOrder;
