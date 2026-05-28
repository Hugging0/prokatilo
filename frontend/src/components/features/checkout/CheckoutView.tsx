import { ArrowLeft, CheckCircle2, Wallet } from "lucide-react";

import { BRAND_GRADIENT } from "@/lib/brand";
import { PAYMENT_METHOD_OPTIONS, UI_COPY } from "@/lib/copy";
import { getTariffPrice } from "@/lib/tariffs";
import type { AppItem, PaymentMethod, TariffType } from "@/types";

interface CheckoutViewProps {
  selectedItem: AppItem;
  selectedTariff: TariffType;
  selectedDate: string;
  selectedTime: string;
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
  paymentMethod,
  deliveryAddress,
  isSubmitting,
  onBack,
  onPaymentMethodChange,
  onDeliveryAddressChange,
  onSubmit,
}: CheckoutViewProps) {
  return (
    <main className="min-h-screen bg-slate-50 px-6 pt-12 pb-32">
      <button
        type="button"
        onClick={onBack}
        className="bg-white p-3 rounded-2xl shadow-sm mb-8"
      >
        <ArrowLeft size={22} />
      </button>

      <h2 className="text-3xl font-black text-slate-900 tracking-tighter leading-none mb-6">
        {UI_COPY.checkout.title}
      </h2>

      <section className="bg-white rounded-[2rem] p-5 border border-slate-100 shadow-sm mb-5">
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
              className={`w-14 h-14 rounded-2xl ${selectedItem.bg} ${selectedItem.color} flex items-center justify-center`}
            >
              <selectedItem.icon size={28} />
            </div>
          )}

          <div>
            <h3 className="font-black text-slate-900">
              {selectedItem.title}
            </h3>
            <p className="text-sm text-slate-400 font-bold">
              {selectedDate} в {selectedTime}
            </p>
          </div>
        </div>
      </section>

      <section className="bg-white rounded-[2rem] p-5 border border-slate-100 shadow-sm mb-5">
        <h3 className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] mb-3">
          {UI_COPY.checkout.deliveryTitle}
        </h3>

        <p className="text-sm font-bold text-slate-500 leading-relaxed mb-4">
          {UI_COPY.checkout.deliveryDescription}
        </p>

        <label
          htmlFor="delivery-address"
          className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2"
        >
          {UI_COPY.checkout.addressLabel}
        </label>

        <input
          id="delivery-address"
          value={deliveryAddress}
          onChange={(event) =>
            onDeliveryAddressChange(event.target.value)
          }
          placeholder={UI_COPY.checkout.addressPlaceholder}
          className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-4 px-4 text-sm font-bold text-slate-700 outline-none focus:border-rose-500 transition-all"
        />
      </section>

      <section className="bg-white rounded-[2rem] p-5 border border-slate-100 shadow-sm">
        <h3 className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] mb-4">
          {UI_COPY.checkout.paymentTitle}
        </h3>

        <p className="text-xs font-bold text-slate-400 leading-relaxed mb-4">
          {UI_COPY.checkout.paymentDisclaimer}
        </p>

        <div className="space-y-3">
          {PAYMENT_METHOD_OPTIONS.map((method) => (
            <button
              key={method.id}
              type="button"
              onClick={() => onPaymentMethodChange(method.id)}
              className={`w-full flex items-center justify-between gap-4 p-5 rounded-3xl border-2 transition-all cursor-pointer ${
                paymentMethod === method.id
                  ? "border-slate-900 bg-slate-900 text-white shadow-xl"
                  : "border-slate-100 bg-white text-slate-900"
              }`}
            >
              <span className="flex min-w-0 flex-1 items-center gap-3 text-left">
                <Wallet size={20} className="shrink-0" />
                <span className="block min-w-0 text-left">
                  <span className="block text-left font-black">
                    {method.label}
                  </span>
                  <span
                    className={`block text-left text-xs font-bold mt-1 ${
                      paymentMethod === method.id
                        ? "text-white/80"
                        : "text-slate-400"
                    }`}
                  >
                    {method.note}
                  </span>
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
        className={`mt-8 w-full ${BRAND_GRADIENT} text-white py-6 rounded-[2rem] font-black text-lg shadow-2xl shadow-rose-200 active:scale-95 transition-transform`}
      >
        {isSubmitting ? "Создаём бронь…" : UI_COPY.checkout.submitButton} ·{" "}
        {getTariffPrice(selectedItem, selectedTariff)}₽
      </button>
    </main>
  );
}
