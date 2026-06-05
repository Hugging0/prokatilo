import { useState } from "react";
import { CalendarDays, MapPin, Phone } from "lucide-react";

import { AppCard } from "@/components/ui/AppCard";
import { formatRentalPeriod, getRentalDurationLabel } from "@/lib/booking-time";
import { getTariffLabel } from "@/lib/tariffs";
import type { AppOrder } from "@/types";

import { getDeliveryHint } from "../lib/order-status-text";
import type { OrderActionId } from "../lib/order-actions";
import { CancelOrderDialog } from "./CancelOrderDialog";
import { DetailRow } from "./DetailRow";
import { EditAddressDialog } from "./EditAddressDialog";
import { OrderActions } from "./OrderActions";
import { OrderDetailsHeader } from "./OrderDetailsHeader";
import { OrderDetailsSection } from "./OrderDetailsSection";
import { OrderNextSteps } from "./OrderNextSteps";
import { OrderPaymentCard } from "./OrderPaymentCard";
import { OrderProductHeader } from "./OrderProductHeader";
import { OrderStatusHero } from "./OrderStatusHero";
import { ReviewBlock } from "./ReviewBlock";
import { SupportContactCard } from "./SupportContactCard";

export function OrderDetailsView({
  order,
  onBack,
  onLeaveReview,
  onUpdateAddress,
  onCancelOrder,
}: {
  order: AppOrder;
  onBack: () => void;
  onLeaveReview: (orderId: number, rating: number, comment: string) => void;
  onUpdateAddress: (orderId: number, address: string) => Promise<void>;
  onCancelOrder: (orderId: number) => Promise<void>;
}) {
  const [isEditAddressOpen, setIsEditAddressOpen] = useState(false);
  const [isCancelOpen, setIsCancelOpen] = useState(false);
  const [isMutating, setIsMutating] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const duration = getRentalDurationLabel(
    new Date(order.rentalStartAt),
    new Date(order.rentalEndAt),
  );

  const handleAction = (action: OrderActionId) => {
    setActionError(null);

    if (action === "edit-address") {
      setIsEditAddressOpen(true);
    }

    if (action === "cancel") {
      setIsCancelOpen(true);
    }

    if (action === "support") {
      document
        .getElementById("order-support")
        ?.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  const updateAddress = async (address: string) => {
    setIsMutating(true);
    setActionError(null);

    try {
      await onUpdateAddress(order.id, address);
      setIsEditAddressOpen(false);
    } catch (error) {
      setActionError(
        error instanceof Error ? error.message : "Не удалось изменить адрес",
      );
    } finally {
      setIsMutating(false);
    }
  };

  const cancelOrder = async () => {
    setIsMutating(true);
    setActionError(null);

    try {
      await onCancelOrder(order.id);
      setIsCancelOpen(false);
    } catch (error) {
      setActionError(
        error instanceof Error ? error.message : "Не удалось отменить бронь",
      );
    } finally {
      setIsMutating(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 px-5 pt-10 pb-32">
      <div className="mx-auto flex max-w-2xl flex-col gap-5">
        <OrderDetailsHeader orderId={order.id} onBack={onBack} />
        <OrderStatusHero order={order} />

        <AppCard>
          <OrderProductHeader order={order} />
        </AppCard>

        <OrderDetailsSection title="Главное по брони">
          <DetailRow
            icon={CalendarDays}
            label={order.status === "returned" ? "Аренда была" : "Когда"}
            value={formatRentalPeriod(order.rentalStartAt, order.rentalEndAt)}
            hint={`${getTariffLabel(order.tariff)} · ${duration}`}
          />
          <DetailRow
            icon={MapPin}
            label="Адрес доставки"
            value={order.deliveryAddress}
            hint={getDeliveryHint(order.status)}
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
        <SupportContactCard />
        <OrderActions order={order} onAction={handleAction} />

        {order.status === "returned" && (
          <ReviewBlock order={order} onLeaveReview={onLeaveReview} />
        )}
      </div>

      {isEditAddressOpen && (
        <EditAddressDialog
          initialAddress={order.deliveryAddress}
          error={actionError}
          isSubmitting={isMutating}
          onClose={() => {
            setIsEditAddressOpen(false);
            setActionError(null);
          }}
          onSubmit={updateAddress}
        />
      )}

      {isCancelOpen && (
        <CancelOrderDialog
          error={actionError}
          isSubmitting={isMutating}
          onClose={() => {
            setIsCancelOpen(false);
            setActionError(null);
          }}
          onConfirm={cancelOrder}
        />
      )}
    </main>
  );
}
