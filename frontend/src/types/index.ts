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
  customerPhone: string;
  tariff: TariffType;
  date: string;
  time: string;
  price: number;
  paymentMethod: PaymentMethod;
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
  price_per_6h: string;
  price_per_24h: string;
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
  price_per_6h: number;
  price_per_24h: number;
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
  price_per_6h: string;
  price_per_24h: string;
  image_url: string;
  icon_key: string;
  sort_order: string;
  is_available: boolean;
  is_active: boolean;
}

export interface BackendOrderDto {
  id: number;
  item_id: number;
  customer_login: string;
  customer_name: string;
  customer_phone: string;
  delivery_address: string;
  payment_method: PaymentMethod;
  tariff_type: TariffType;
  total_price: string;
  status: OrderStatus;
  comment: string | null;
  rental_date: string;
  rental_time: string;
  created_at: string;
  updated_at: string;
  item: BackendItemDto;
}

export interface CreateOrderPayload {
  item_id: number;
  customer_name: string;
  customer_phone: string;
  delivery_address: string;
  payment_method: PaymentMethod;
  tariff_type: TariffType;
  total_price: number;
  rental_date: string;
  rental_time: string;
  comment?: string | null;
}

export interface AdminOrderUpdatePayload {
  customer_name?: string;
  customer_phone?: string;
  delivery_address?: string;
  payment_method?: PaymentMethod;
  tariff_type?: TariffType;
  total_price?: number;
  rental_date?: string;
  rental_time?: string;
  comment?: string | null;
}

export type Item = AppItem;
export type Order = AppOrder;
