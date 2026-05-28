import type { LucideIcon } from "lucide-react";
import {
  Ban,
  CheckCircle2,
  Clock,
  History,
  Package,
  Zap,
} from "lucide-react";

import type { OrderStatus } from "@/types";

interface OrderStatusMeta {
  label: string;
  clientLabel: string;
  operatorLabel: string;
  description: string;
  color: string;
  icon: LucideIcon;
}

export const ORDER_STATUSES: Record<OrderStatus, OrderStatusMeta> = {
  pending: {
    label: "Ожидает подтверждения",
    clientLabel: "Ожидает подтверждения",
    operatorLabel: "Новая заявка",
    description: "Мы проверяем наличие и скоро подтвердим бронь.",
    color: "bg-amber-100 text-amber-600",
    icon: Clock,
  },
  confirmed: {
    label: "Подтверждён",
    clientLabel: "Подтверждён",
    operatorLabel: "Подтверждена",
    description: "Бронь подтверждена, готовим вещь к передаче.",
    color: "bg-blue-100 text-blue-600",
    icon: CheckCircle2,
  },
  delivery: {
    label: "Курьер в пути",
    clientLabel: "Курьер в пути",
    operatorLabel: "Доставка",
    description: "Курьер уже везёт вещь по указанному адресу.",
    color: "bg-indigo-100 text-indigo-600",
    icon: Zap,
  },
  active: {
    label: "В аренде",
    clientLabel: "В аренде",
    operatorLabel: "У клиента",
    description: "Вещь сейчас у вас. Верните её к окончанию аренды.",
    color: "bg-emerald-100 text-emerald-600",
    icon: Package,
  },
  returned: {
    label: "Возвращена",
    clientLabel: "Возвращена",
    operatorLabel: "Возвращена",
    description: "Аренда завершена, вещь вернулась в сервис.",
    color: "bg-slate-100 text-slate-500",
    icon: History,
  },
  cancelled: {
    label: "Отменена",
    clientLabel: "Отменена",
    operatorLabel: "Отменена",
    description: "Бронь отменена. Деньги не списывались.",
    color: "bg-red-100 text-red-600",
    icon: Ban,
  },
};

export const ORDER_STATUS_OPTIONS: OrderStatus[] = [
  "pending",
  "confirmed",
  "delivery",
  "active",
  "returned",
  "cancelled",
];

export function getAllowedNextOrderStatuses(
  status: OrderStatus,
): OrderStatus[] {
  switch (status) {
    case "pending":
      return ["confirmed", "cancelled"];
    case "confirmed":
      return ["delivery", "active", "cancelled"];
    case "delivery":
      return ["active", "cancelled"];
    case "active":
      return ["returned"];
    case "returned":
    case "cancelled":
      return [];
  }
}
