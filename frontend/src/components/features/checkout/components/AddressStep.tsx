import { MapPin } from "lucide-react";

import { CheckoutPanel } from "./CheckoutPanel";
import { PanelLabel } from "./PanelLabel";
import { StepTitle } from "./StepTitle";

export function AddressStep({
  deliveryAddress,
  courierComment,
  clarifyAddress,
  onDeliveryAddressChange,
  onCourierCommentChange,
  onClarifyAddressChange,
}: {
  deliveryAddress: string;
  courierComment: string;
  clarifyAddress: boolean;
  onDeliveryAddressChange: (address: string) => void;
  onCourierCommentChange: (comment: string) => void;
  onClarifyAddressChange: (value: boolean) => void;
}) {
  return (
    <section>
      <StepTitle
        title="Куда доставить?"
        subtitle="Укажите адрес или уточните с оператором"
      />

      <div className="mt-7 space-y-5">
        <CheckoutPanel>
          <PanelLabel icon={MapPin} label="Адрес доставки" />
          <input
            value={deliveryAddress}
            onChange={(event) => onDeliveryAddressChange(event.target.value)}
            disabled={clarifyAddress}
            placeholder="Улица, дом, подъезд, квартира"
            className="mt-4 w-full rounded-2xl border border-slate-100 bg-slate-50 px-4 py-4 text-base font-bold text-slate-700 outline-none transition focus:border-slate-300 disabled:text-slate-300"
          />
          <textarea
            value={courierComment}
            onChange={(event) => onCourierCommentChange(event.target.value)}
            placeholder="Комментарий курьеру"
            rows={3}
            className="mt-3 w-full resize-none rounded-2xl border border-slate-100 bg-slate-50 px-4 py-4 text-base font-bold text-slate-700 outline-none transition focus:border-slate-300"
          />
        </CheckoutPanel>

        <label className="flex cursor-pointer items-start gap-3 rounded-[1.5rem] border border-slate-100 bg-white p-5 shadow-sm">
          <input
            type="checkbox"
            checked={clarifyAddress}
            onChange={(event) => onClarifyAddressChange(event.target.checked)}
            className="mt-1 h-5 w-5 rounded border-slate-300 text-slate-900"
          />
          <span>
            <span className="block text-base font-black text-slate-900">
              Уточнить адрес с оператором
            </span>
            <span className="mt-1 block text-sm font-bold text-slate-500">
              Мы свяжемся после создания брони.
            </span>
          </span>
        </label>
      </div>
    </section>
  );
}
