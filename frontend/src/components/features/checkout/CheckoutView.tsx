import { ArrowLeft, CheckCircle2 } from "lucide-react";

import { BRAND_GRADIENT } from "@/lib/brand";
import {
  formatRentalPeriod,
  getRentalDurationLabel,
  getSelectedRentalInterval,
} from "@/lib/booking-time";
import { PAYMENT_METHOD_OPTIONS, UI_COPY } from "@/lib/copy";
import { getRentalTotalPrice } from "@/lib/tariffs";
import type { AppItem, PaymentMethod, TariffType } from "@/types";

interface CheckoutViewProps {
  selectedItem: AppItem;
  selectedTariff: TariffType;
  selectedDate: string;
  selectedTime: string;
  selectedEndDate: string;
  selectedEndTime: string;
  paymentMethod: PaymentMethod;
  deliveryAddress: string;
  isSubmitting: boolean;
  onBack: () => void;
  onPaymentMethodChange: (method: PaymentMethod) => void;
  onDeliveryAddressChange: (address: string) => void;
  onSubmit: () => void;
}

export function CheckoutView({
  selectedItem,
  selectedTariff,
  selectedDate,
  selectedTime,
  selectedEndDate,
  selectedEndTime,
  paymentMethod,
  deliveryAddress,
  isSubmitting,
  onBack,
  onPaymentMethodChange,
  onDeliveryAddressChange,
  onSubmit,
}: CheckoutViewProps) {
  const selectedInterval = getSelectedRentalInterval(
    selectedDate,
    selectedTime,
    selectedEndDate,
    selectedEndTime,
  );
  const totalPrice = getRentalTotalPrice(
    selectedItem,
    selectedTariff,
    selectedInterval?.startAt ?? null,
    selectedInterval?.endAt ?? null,
  );

  return (
    <main className="min-h-screen bg-slate-50 px-6 pt-12 pb-32">
      <button
        type="button"
        onClick={onBack}
        className="mb-8 rounded-2xl bg-white p-3 shadow-sm"
      >
        <ArrowLeft size={22} />
      </button>

      <h2 className="mb-6 text-3xl font-black leading-none tracking-tight text-slate-900">
        {UI_COPY.checkout.title}
      </h2>

      <section className="mb-5 rounded-[2rem] border border-slate-100 bg-white p-5 shadow-sm">
        <div className="flex items-center gap-4">
          {selectedItem.imageUrl ? (
            <div className="h-14 w-14 overflow-hidden rounded-2xl bg-slate-100">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={selectedItem.imageUrl}
                alt={selectedItem.title}
                className="h-full w-full object-cover"
              />
            </div>
          ) : (
            <div
              className={`flex h-14 w-14 items-center justify-center rounded-2xl ${selectedItem.bg} ${selectedItem.color}`}
            >
              <selectedItem.icon size={28} />
            </div>
          )}

          <div>
            <h3 className="font-black text-slate-900">
              {selectedItem.title}
            </h3>
            <p className="text-sm font-bold text-slate-400">
              {selectedItem.category}
            </p>
          </div>
        </div>

        <div className="mt-5 divide-y divide-slate-100 rounded-2xl bg-slate-50 px-4 text-sm font-bold">
          <SummaryRow
            label="Период"
            value={
              selectedInterval
                ? formatRentalPeriod(
                    selectedInterval.startAt,
                    selectedInterval.endAt,
                  )
                : "Не выбран"
            }
          />
          <SummaryRow
            label="Срок"
            value={getRentalDurationLabel(
              selectedInterval?.startAt ?? null,
              selectedInterval?.endAt ?? null,
            )}
          />
          <SummaryRow label="Стоимость" value={`${totalPrice}₽`} />
        </div>
      </section>

      <section className="mb-5 rounded-[2rem] border border-slate-100 bg-white p-5 shadow-sm">
        <label
          htmlFor="delivery-address"
          className="block text-[10px] font-black uppercase tracking-widest text-slate-400"
        >
          {UI_COPY.checkout.addressLabel}
        </label>
        <input
          id="delivery-address"
          value={deliveryAddress}
          onChange={(event) => onDeliveryAddressChange(event.target.value)}
          placeholder={UI_COPY.checkout.addressPlaceholder}
          className="mt-3 w-full rounded-2xl border border-slate-100 bg-slate-50 px-4 py-4 text-sm font-bold text-slate-700 outline-none transition focus:border-slate-300"
        />
      </section>

      <section className="rounded-[2rem] border border-slate-100 bg-white p-5 shadow-sm">
        <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400">
          {UI_COPY.checkout.paymentTitle}
        </h3>

        <div className="mt-4 grid gap-2">
          {PAYMENT_METHOD_OPTIONS.map((method) => (
            <button
              key={method.id}
              type="button"
              onClick={() => onPaymentMethodChange(method.id)}
              className={`flex items-center justify-between gap-4 rounded-2xl border px-4 py-4 text-left transition ${
                paymentMethod === method.id
                  ? "border-slate-900 bg-slate-900 text-white"
                  : "border-slate-100 bg-slate-50 text-slate-800"
              }`}
            >
              <span>
                <span className="block text-sm font-black">
                  {method.label}
                </span>
                <span
                  className={`mt-1 block text-xs font-bold ${
                    paymentMethod === method.id
                      ? "text-white/70"
                      : "text-slate-400"
                  }`}
                >
                  {method.note}
                </span>
              </span>
              {paymentMethod === method.id && (
                <CheckCircle2 size={20} className="shrink-0" />
              )}
            </button>
          ))}
        </div>
      </section>

      <button
        type="button"
        onClick={onSubmit}
        disabled={isSubmitting}
        className={`mt-8 w-full rounded-[2rem] ${BRAND_GRADIENT} py-6 text-lg font-black text-white shadow-2xl shadow-rose-200 transition-transform active:scale-95 disabled:opacity-70`}
      >
        {isSubmitting ? "Создаём бронь…" : UI_COPY.checkout.submitButton} ·{" "}
        {totalPrice}₽
      </button>
    </main>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 py-3">
      <span className="shrink-0 text-slate-400">{label}</span>
      <span className="text-right text-slate-800">{value}</span>
    </div>
  );
}
