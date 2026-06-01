import { Package } from "lucide-react";

import { UI_COPY } from "@/lib/copy";
import { mapBackendItemToAppItem } from "@/lib/mappers/items";
import type {
  AppItem,
  AppOrder,
  BackendOrderDto,
  CreateOrderPayload,
  PaymentMethod,
  TariffType,
  User,
} from "@/types";

const FALLBACK_ITEM_STYLES = {
  icon: Package,
  color: "text-slate-500",
  bg: "bg-slate-100",
};

export function mapBackendOrderToAppOrder(
  order: BackendOrderDto,
  item?: AppItem,
  existingReview: AppOrder["review"] = null,
): AppOrder {
  const mappedItem = item ?? mapBackendItemToAppItem(order.item);

  return {
    id: order.id,
    itemId: order.item_id,
    title: mappedItem?.title || order.item.title,
    icon: mappedItem?.icon || FALLBACK_ITEM_STYLES.icon,
    color: mappedItem?.color || FALLBACK_ITEM_STYLES.color,
    bg: mappedItem?.bg || FALLBACK_ITEM_STYLES.bg,
    customerName: order.customer_name,
    customerPhone: order.customer_phone,
    tariff: order.tariff_type,
    date: order.rental_date,
    time: order.rental_time,
    rentalStartAt: order.rental_start_at,
    rentalEndAt: order.rental_end_at,
    price: Number(order.total_price),
    paymentMethod: order.payment_method,
    paymentStatus: order.payment_status,
    paymentConfirmationUrl: order.yookassa_confirmation_url,
    providerPaymentId: order.yookassa_payment_id,
    deliveryAddress: order.delivery_address,
    status: order.status,
    comment: order.comment,
    createdAt: order.created_at,
    updatedAt: order.updated_at,
    review: existingReview,
  };
}

export function mapBackendOrdersToAppOrders(
  orders: BackendOrderDto[],
  items: AppItem[],
  existingOrders: AppOrder[] = [],
): AppOrder[] {
  const itemsById = new Map(items.map((item) => [item.id, item]));
  const reviewsByOrderId = new Map(
    existingOrders.map((order) => [order.id, order.review]),
  );

  return orders.map((order) =>
    mapBackendOrderToAppOrder(
      order,
      itemsById.get(order.item_id),
      reviewsByOrderId.get(order.id) ?? null,
    ),
  );
}

export function mapAppCheckoutToOrderCreatePayload(input: {
  user: User;
  item: AppItem;
  tariff: TariffType;
  paymentMethod: PaymentMethod;
  deliveryAddress: string;
  selectedDate: string;
  selectedTime: string;
  totalPrice: number;
}): CreateOrderPayload {
  return {
    item_id: input.item.id,
    customer_name: input.user.name,
    customer_email: input.user.email,
    customer_phone: input.user.phone,
    delivery_address:
      input.deliveryAddress.trim() || UI_COPY.checkout.addressFallback,
    payment_method: input.paymentMethod,
    tariff_type: input.tariff,
    total_price: input.totalPrice,
    rental_date: input.selectedDate,
    rental_time: input.selectedTime,
    comment: null,
  };
}
