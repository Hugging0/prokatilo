import { Info, MapPin, Truck } from "lucide-react";
import { useState } from "react";

import { CheckoutPanel } from "./CheckoutPanel";
import { PanelLabel } from "./PanelLabel";
import { StepTitle } from "./StepTitle";
import {
  getAddressSuggestions,
  type DeliveryEstimate,
} from "../lib/delivery-zone";

export function AddressStep({
  deliveryAddress,
  courierComment,
  deliveryEstimate,
  onDeliveryAddressChange,
  onCourierCommentChange,
}: {
  deliveryAddress: string;
  courierComment: string;
  deliveryEstimate: DeliveryEstimate;
  onDeliveryAddressChange: (address: string) => void;
  onCourierCommentChange: (comment: string) => void;
}) {
  const [isDeliveryInfoOpen, setIsDeliveryInfoOpen] = useState(false);
  const addressSuggestions = getAddressSuggestions(deliveryAddress);

  return (
    <section>
      <StepTitle
        title="Куда доставить?"
        subtitle="Укажите адрес, оператор подтвердит заказ"
      />

      <div className="mt-7 space-y-5">
        <CheckoutPanel>
          <PanelLabel icon={MapPin} label="Адрес доставки" />
          <input
            value={deliveryAddress}
            onChange={(event) => onDeliveryAddressChange(event.target.value)}
            placeholder="Например: Профсоюзная 152"
            className="mt-4 w-full rounded-2xl border border-slate-100 bg-slate-50 px-4 py-4 text-base font-bold text-slate-700 outline-none transition focus:border-slate-300"
          />
          {addressSuggestions.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {addressSuggestions.map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  onClick={() => onDeliveryAddressChange(suggestion)}
                  className="rounded-2xl border border-slate-100 bg-white px-4 py-2 text-sm font-black text-slate-700 shadow-sm transition hover:border-slate-200 active:scale-95"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          )}
          <div className="mt-3 rounded-2xl border border-orange-100 bg-orange-50 px-4 py-3">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex min-w-0 items-center gap-3">
                <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-xl bg-white text-orange-600">
                  <Truck size={17} />
                </span>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-base font-black text-slate-900">
                      Доставка
                    </p>
                    <button
                      type="button"
                      onClick={() =>
                        setIsDeliveryInfoOpen((isOpen) => !isOpen)
                      }
                      className="flex size-6 items-center justify-center rounded-full bg-white text-orange-700 transition hover:bg-orange-100"
                      aria-label="Как считается доставка"
                      aria-expanded={isDeliveryInfoOpen}
                    >
                      <Info size={14} />
                    </button>
                  </div>
                  <p className="mt-1 text-sm font-bold leading-relaxed text-orange-800">
                    {deliveryEstimate.shortNote}
                  </p>
                </div>
              </div>
              <span className="w-fit shrink-0 rounded-xl bg-white px-3 py-2 text-sm font-black text-orange-700">
                {deliveryEstimate.priceLabel}
              </span>
            </div>
            {isDeliveryInfoOpen && (
              <p className="mt-3 rounded-2xl bg-white px-4 py-3 text-sm font-bold leading-relaxed text-slate-600">
                До 3 км от Малой Очаковской доставка бесплатная. До 7 км —
                300–500 ₽. Остальные адреса оператор подтвердит после брони.
              </p>
            )}
          </div>
          <textarea
            value={courierComment}
            onChange={(event) => onCourierCommentChange(event.target.value)}
            placeholder="Комментарий курьеру"
            rows={3}
            className="mt-3 w-full resize-none rounded-2xl border border-slate-100 bg-slate-50 px-4 py-4 text-base font-bold text-slate-700 outline-none transition focus:border-slate-300"
          />
        </CheckoutPanel>
      </div>
    </section>
  );
}
