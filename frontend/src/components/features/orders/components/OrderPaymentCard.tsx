import { AppCard } from "@/components/ui/AppCard";
import type { AppOrder } from "@/types";

import { ORDER_DETAILS_COPY } from "../lib/order-details-copy";

export function OrderPaymentCard({ order }: { order: AppOrder }) {
  const paymentCopy = getPaymentCopy(order);

  return (
    <AppCard>
      <p className="text-xs font-black uppercase tracking-widest text-slate-500">
        {ORDER_DETAILS_COPY.payment.title}
      </p>
      <div className="mt-4 flex items-end justify-between gap-4">
        <div>
          <h2 className="text-lg font-black leading-snug text-slate-950">
            {paymentCopy.title}
          </h2>
          {paymentCopy.hint && (
            <p className="mt-2 text-base font-bold leading-relaxed text-slate-500">
              {paymentCopy.hint}
            </p>
          )}
        </div>
        {paymentCopy.price && (
          <p className="shrink-0 text-2xl font-black tracking-tight text-slate-950">
            {paymentCopy.price}
          </p>
        )}
      </div>
    </AppCard>
  );
}

function getPaymentCopy(order: AppOrder) {
  if (order.status === "cancelled") {
    return {
      title: ORDER_DETAILS_COPY.payment.cancelledTitle,
      hint: ORDER_DETAILS_COPY.payment.cancelledHint,
      price: null,
    };
  }

  if (order.status === "returned") {
    return {
      title: ORDER_DETAILS_COPY.payment.returnedTotal,
      hint: ORDER_DETAILS_COPY.payment.returnedHint,
      price: `${order.price} ₽`,
    };
  }

  return {
    title: ORDER_DETAILS_COPY.payment.courierPayment,
    hint: null,
    price: `${order.price} ₽`,
  };
}
