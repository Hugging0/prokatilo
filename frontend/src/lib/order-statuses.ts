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
  color: string;
  icon: LucideIcon;
}

export const ORDER_STATUSES: Record<OrderStatus, OrderStatusMeta> = {
  pending: {
    label: "Ожидает",
    color: "bg-amber-100 text-amber-600",
    icon: Clock,
  },
  confirmed: {
    label: "Подтвержден",
    color: "bg-blue-100 text-blue-600",
    icon: CheckCircle2,
  },
  delivery: {
    label: "В пути",
    color: "bg-indigo-100 text-indigo-600",
    icon: Zap,
  },
  active: {
    label: "У клиента",
    color: "bg-emerald-100 text-emerald-600",
    icon: Package,
  },
  returned: {
    label: "Возвращен",
    color: "bg-slate-100 text-slate-500",
    icon: History,
  },
  cancelled: {
    label: "Отменен",
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
