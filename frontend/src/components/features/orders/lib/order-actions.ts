import {
  Clock3,
  MapPin,
  MessageCircle,
  RotateCw,
  Trash2,
  type LucideIcon,
} from "lucide-react";

import { UI_COPY } from "@/lib/copy";
import type { AppOrder } from "@/types";

export function getActionsForOrder(order: AppOrder): Array<{
  label: string;
  icon: LucideIcon;
  tone?: "danger";
}> {
  switch (order.status) {
    case "pending":
      return [
        { label: UI_COPY.orders.supportButton, icon: MessageCircle },
        { label: "Изменить адрес", icon: MapPin },
        { label: "Отменить бронь", icon: Trash2, tone: "danger" },
      ];
    case "confirmed":
    case "delivery":
      return [
        { label: UI_COPY.orders.supportButton, icon: MessageCircle },
        { label: "Изменить адрес", icon: MapPin },
      ];
    case "active":
      return [
        { label: "Продлить аренду", icon: Clock3 },
        { label: "Оформить возврат", icon: RotateCw },
        { label: UI_COPY.orders.supportButton, icon: MessageCircle },
      ];
    case "returned":
    case "cancelled":
      return [
        { label: "Повторить бронь", icon: RotateCw },
        { label: UI_COPY.orders.supportButton, icon: MessageCircle },
      ];
  }
}
