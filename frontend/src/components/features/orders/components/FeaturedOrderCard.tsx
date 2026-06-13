import { CalendarDays, ChevronRight, MapPin } from "lucide-react";

import { AppButton } from "@/components/ui/AppButton";
import { formatDateTime, formatDeliveryWindow } from "@/lib/booking-time";
import { BRAND_GRADIENT } from "@/lib/brand";
import { getTariffLabel } from "@/lib/tariffs";
import type { AppOrder } from "@/types";

import { OrderFact } from "./OrderFact";
import { OrderProductHeader } from "./OrderProductHeader";

export function FeaturedOrderCard({
  order,
  onOpen,
}: {
  order: AppOrder;
  onOpen: () => void;
}) {
  const hasActualRental = Boolean(order.rentalStartAt && order.rentalEndAt);

  return (
    <article className="rounded-[1.75rem] border border-slate-100 bg-white p-5 shadow-sm">
      <OrderProductHeader order={order} />
      <div className="mt-5 flex flex-col gap-4">
        <OrderFact
          icon={CalendarDays}
          label={hasActualRental ? "Вернуть до" : "Доставка"}
          value={
            hasActualRental
              ? formatDateTime(order.rentalEndAt)
              : formatDeliveryWindow(order.date, order.time)
          }
          hint={
            hasActualRental
              ? `Аренда началась: ${formatDateTime(order.rentalStartAt)}`
              : `Срок аренды: ${getTariffLabel(order.tariff)}`
          }
        />
        <OrderFact
          icon={MapPin}
          label="Доставка"
          value={order.deliveryAddress}
        />
      </div>
      <AppButton
        type="button"
        onClick={onOpen}
        fullWidth
        className={`mt-5 ${BRAND_GRADIENT}`}
      >
        Подробнее о брони
        <ChevronRight size={19} />
      </AppButton>
    </article>
  );
}
