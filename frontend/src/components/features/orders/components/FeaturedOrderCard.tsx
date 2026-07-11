import { ChevronRight, MapPin, WalletCards } from "lucide-react";

import { AppButton } from "@/components/ui/AppButton";
import { BRAND_GRADIENT } from "@/lib/brand";
import { getTariffLabel } from "@/lib/tariffs";
import type { AppOrder } from "@/types";

import {
  getOrderPaymentSummary,
  getOrderPrimaryMessage,
} from "../lib/order-primary-message";
import { OrderIcon } from "./OrderIcon";
import { StatusBadge } from "./StatusBadge";

export function FeaturedOrderCard({
  order,
  onOpen,
}: {
  order: AppOrder;
  onOpen: () => void;
}) {
  const message = getOrderPrimaryMessage(order);
  const payment = getOrderPaymentSummary(order);

  return (
    <article className="overflow-hidden rounded-[1.75rem] border border-slate-100 bg-white shadow-sm">
      <div className="p-5">
        <div className="flex items-center justify-between gap-3">
          <StatusBadge status={order.status} />
          <span className="shrink-0 text-xs font-extrabold text-slate-400">
            № {order.id}
          </span>
        </div>

        <div className="mt-5">
          <h2 className="text-2xl font-black leading-tight tracking-tight text-slate-950 [text-wrap:balance]">
            {message.title}
          </h2>
          <p className="mt-2 text-sm font-bold leading-relaxed text-slate-500">
            {message.description}
          </p>
        </div>

        <div className="mt-5 flex items-center gap-4 border-t border-slate-100 pt-5">
          <OrderIcon order={order} />
          <div className="min-w-0">
            <h3 className="truncate text-lg font-black leading-snug text-slate-950">
              {order.title}
            </h3>
            <p className="mt-1 text-sm font-bold text-slate-500">
              Аренда: {getTariffLabel(order.tariff)}
            </p>
          </div>
        </div>
      </div>

      <div className="grid border-y border-slate-100 bg-slate-50 sm:grid-cols-2">
        <div className="flex min-w-0 items-start gap-3 px-5 py-4">
          <MapPin className="mt-0.5 shrink-0 text-slate-400" size={18} />
          <div className="min-w-0">
            <p className="text-xs font-extrabold text-slate-400">Адрес</p>
            <p className="mt-1 truncate text-sm font-bold text-slate-700">
              {order.deliveryAddress}
            </p>
          </div>
        </div>

        <div className="flex min-w-0 items-start gap-3 border-t border-slate-200 px-5 py-4 sm:border-l sm:border-t-0">
          <WalletCards
            className="mt-0.5 shrink-0 text-slate-400"
            size={18}
          />
          <div className="min-w-0">
            <p className="text-xs font-extrabold text-slate-400">
              {payment.label}
            </p>
            <p className="mt-1 text-sm font-bold text-slate-700">
              {payment.value}
            </p>
          </div>
        </div>
      </div>

      <div className="p-5">
        <AppButton
          type="button"
          onClick={onOpen}
          fullWidth
          className={BRAND_GRADIENT}
        >
          Открыть бронь
          <ChevronRight size={19} />
        </AppButton>
      </div>
    </article>
  );
}
