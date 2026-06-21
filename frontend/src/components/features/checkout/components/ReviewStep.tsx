import type { AppItem } from "@/types";

import { CheckoutPanel } from "./CheckoutPanel";
import { ReviewRow } from "./ReviewRow";
import { StepTitle } from "./StepTitle";
import type { DeliveryEstimate } from "../lib/delivery-zone";

export function ReviewStep({
  selectedItem,
  deliveryAddress,
  clarifyAddress,
  deliveryEstimate,
  deliveryIntervalSummary,
  rentalDurationSummary,
  hasSelectedInterval,
  onEditTiming,
  onEditAddress,
}: {
  selectedItem: AppItem;
  deliveryAddress: string;
  clarifyAddress: boolean;
  deliveryEstimate: DeliveryEstimate;
  deliveryIntervalSummary: string;
  rentalDurationSummary: string;
  hasSelectedInterval: boolean;
  onEditTiming: () => void;
  onEditAddress: () => void;
}) {
  return (
    <section>
      <StepTitle
        title="Проверьте бронь"
        subtitle="Убедитесь, что всё указано верно"
      />

      <div className="mt-7 space-y-4">
        <CheckoutPanel>
          <div className="flex items-center gap-4">
            {selectedItem.imageUrl ? (
              <div className="h-16 w-16 overflow-hidden rounded-2xl bg-slate-100">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={selectedItem.imageUrl}
                  alt={selectedItem.title}
                  className="h-full w-full object-cover"
                />
              </div>
            ) : (
              <div
                className={`flex h-16 w-16 items-center justify-center rounded-2xl ${selectedItem.bg} ${selectedItem.color}`}
              >
                <selectedItem.icon size={30} />
              </div>
            )}
            <div className="min-w-0">
              <h3 className="truncate text-lg font-black text-slate-900">
                {selectedItem.title}
              </h3>
              <p className="mt-1 text-base font-bold text-slate-500">
                {selectedItem.category}
              </p>
            </div>
          </div>
        </CheckoutPanel>

        <ReviewRow
          title="Окно доставки"
          value={hasSelectedInterval ? deliveryIntervalSummary : "Не выбрано"}
          onEdit={onEditTiming}
        />
        <ReviewRow
          title="Срок аренды"
          value={hasSelectedInterval ? rentalDurationSummary : "Не выбрано"}
          onEdit={onEditTiming}
        />
        <ReviewRow
          title="Наличие"
          value="Предварительно доступно. Оператор подтвердит бронь."
        />
        <ReviewRow
          title="Адрес доставки"
          value={clarifyAddress ? "Адрес уточнит оператор" : deliveryAddress}
          onEdit={onEditAddress}
        />
        <ReviewRow
          title="Доставка"
          value={`${deliveryEstimate.priceLabel}. ${deliveryEstimate.description}`}
          onEdit={onEditAddress}
        />
      </div>
    </section>
  );
}
