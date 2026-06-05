import type { AppOrder } from "@/types";

export function OrderIcon({
  order,
  compact = false,
}: {
  order: AppOrder;
  compact?: boolean;
}) {
  return (
    <div
      className={`flex shrink-0 items-center justify-center rounded-2xl ${order.bg} ${order.color} ${
        compact ? "size-14" : "size-16"
      }`}
    >
      <order.icon size={compact ? 24 : 30} />
    </div>
  );
}
