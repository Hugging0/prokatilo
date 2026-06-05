import { MapPin, MessageCircle, Trash2, type LucideIcon } from "lucide-react";

import type { AppOrder } from "@/types";

export type OrderActionId = "support" | "edit-address" | "cancel";
type OrderAction = {
  id: OrderActionId;
  label: string;
  icon: LucideIcon;
  tone?: "danger";
};

export function getActionsForOrder(order: AppOrder): OrderAction[] {
  const actions: OrderAction[] = [
    { id: "support", label: "Написать в поддержку", icon: MessageCircle },
  ];

  if (order.status === "pending" || order.status === "confirmed") {
    actions.push(
      { id: "edit-address", label: "Изменить адрес", icon: MapPin },
      { id: "cancel", label: "Отменить бронь", icon: Trash2, tone: "danger" },
    );
  }

  return actions;
}
