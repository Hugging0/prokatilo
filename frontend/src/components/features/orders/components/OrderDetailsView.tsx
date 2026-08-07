import { CalendarDays, MapPin, Phone } from "lucide-react";

import { AppCard } from "@/components/ui/AppCard";
import { formatDateTime, formatDeliveryWindow } from "@/lib/booking-time";
import { getTariffLabel } from "@/lib/tariffs";
import type { AppOrder, PublicServiceSettingsDto } from "@/types";

import { DetailRow } from "./DetailRow";
import { OrderDetailsHeader } from "./OrderDetailsHeader";
import { OrderDetailsSection } from "./OrderDetailsSection";
import { OrderNextSteps } from "./OrderNextSteps";
import { OrderPaymentCard } from "./OrderPaymentCard";
import { OrderProductHeader } from "./OrderProductHeader";
import { OrderStatusHero } from "./OrderStatusHero";
import { ReviewBlock } from "./ReviewBlock";
import { SupportContactCard } from "./SupportContactCard";
import { InstructionSummaryCard } from "./InstructionSummaryCard";

export function OrderDetailsView({
  order,
  onBack,
  onLeaveReview,
  onOpenInstruction,
  serviceSettings,
}: {
  order: AppOrder;
  onBack: () => void;
  onLeaveReview: (orderId: number, rating: number, comment: string) => void;
  onOpenInstruction: () => void;
  serviceSettings: PublicServiceSettingsDto;
}) {
  const hasActualRental = Boolean(order.rentalStartAt && order.rentalEndAt);
  const shouldShowInstruction =
    order.instruction &&
    ["confirmed", "delivery", "active", "returned"].includes(order.status);

  return (
    <main className="min-h-screen bg-slate-50 px-5 pt-10 pb-32">
      <div className="mx-auto flex max-w-2xl flex-col gap-5">
        <OrderDetailsHeader orderId={order.id} onBack={onBack} />
        <OrderStatusHero order={order} />

        <AppCard>
          <OrderProductHeader order={order} showDuration={false} />
        </AppCard>

        {shouldShowInstruction && (
          <InstructionSummaryCard
            instruction={order.instruction!}
            onOpen={onOpenInstruction}
          />
        )}

        <OrderDetailsSection title="Главное по брони">
          <DetailRow
            icon={CalendarDays}
            label={hasActualRental ? "Вернуть до" : "Окно доставки"}
            value={
              hasActualRental
                ? formatDateTime(order.rentalEndAt)
                : formatDeliveryWindow(order.date, order.time)
            }
            hint={
              hasActualRental
                ? `Передано клиенту: ${formatDateTime(order.rentalStartAt)}`
                : `Срок аренды: ${getTariffLabel(order.tariff)}`
            }
          />
          <DetailRow
            icon={MapPin}
            label="Адрес доставки"
            value={order.deliveryAddress}
          />
          <DetailRow
            icon={Phone}
            label="Телефон для связи"
            value={order.customerPhone}
            hint={order.customerName}
          />
        </OrderDetailsSection>

        <OrderPaymentCard order={order} />
        <OrderNextSteps order={order} />
        <SupportContactCard
          supportPhone={serviceSettings.support_phone}
          supportTelegramUrl={serviceSettings.support_telegram_url}
        />

        {order.status === "returned" && (
          <ReviewBlock order={order} onLeaveReview={onLeaveReview} />
        )}
      </div>
    </main>
  );
}
