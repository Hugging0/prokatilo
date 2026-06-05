import { AppButton } from "@/components/ui/AppButton";
import type { AppOrder } from "@/types";

import {
  getActionsForOrder,
  type OrderActionId,
} from "../lib/order-actions";

export function OrderActions({
  order,
  onAction,
}: {
  order: AppOrder;
  onAction: (action: OrderActionId) => void;
}) {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-lg font-black tracking-tight text-slate-950">
        Что можно сделать
      </h2>
      {getActionsForOrder(order).map((action) => (
        <AppButton
          key={action.id}
          type="button"
          variant={action.tone === "danger" ? "danger" : "secondary"}
          onClick={() => onAction(action.id)}
          fullWidth
          className="justify-between"
        >
          <span className="flex items-center gap-3">
            <action.icon size={20} />
            {action.label}
          </span>
        </AppButton>
      ))}
    </section>
  );
}
