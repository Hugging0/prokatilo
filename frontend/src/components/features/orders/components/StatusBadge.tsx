import { AppBadge } from "@/components/ui/AppBadge";
import { ORDER_STATUSES } from "@/lib/order-statuses";
import type { OrderStatus } from "@/types";

export function StatusBadge({ status }: { status: OrderStatus }) {
  const meta = ORDER_STATUSES[status];

  return (
    <AppBadge className={meta.color}>
      <meta.icon size={14} />
      {meta.clientLabel}
    </AppBadge>
  );
}
