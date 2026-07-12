import type { AppOrder } from "@/types";

export function OrderIcon({
  order,
  compact = false,
}: {
  order: AppOrder;
  compact?: boolean;
}) {
  const sizeClass = compact ? "size-14" : "size-16";

  if (order.imageUrl) {
    return (
      <div
        className={`shrink-0 overflow-hidden rounded-2xl bg-slate-100 ${sizeClass}`}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={order.imageUrl}
          alt={order.title}
          className="h-full w-full object-contain"
        />
      </div>
    );
  }

  return (
    <div
      className={`flex shrink-0 items-center justify-center rounded-2xl ${order.bg} ${order.color} ${sizeClass}`}
    >
      <order.icon size={compact ? 24 : 30} />
    </div>
  );
}
