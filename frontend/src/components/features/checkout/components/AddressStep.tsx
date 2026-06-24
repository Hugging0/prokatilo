import { Info, MapPin } from "lucide-react";
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
        title="Куда привезти?"
        subtitle="Улица, дом и квартира"
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
          <div className="mt-3">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm font-bold leading-relaxed text-slate-500">
              <span>Ориентировочная доставка:</span>
              <span className="font-black text-slate-900">
                {deliveryEstimate.priceLabel}
              </span>
              {deliveryEstimate.needsOperatorConfirmation && (
                <span>Стоимость уточним после брони.</span>
              )}
              <button
                type="button"
                onClick={() => setIsDeliveryInfoOpen((isOpen) => !isOpen)}
                className="inline-flex size-6 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition hover:bg-slate-200 hover:text-slate-700"
                aria-label="Как считается доставка"
                aria-expanded={isDeliveryInfoOpen}
              >
                <Info size={14} />
              </button>
            </div>
            {isDeliveryInfoOpen && (
              <p className="mt-2 rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm font-bold leading-relaxed text-slate-600">
                Для ближайших адресов доставка без доплаты. В остальных зонах
                стоимость зависит от маршрута, уточним её после брони.
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
