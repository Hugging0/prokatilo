import { Phone, Send } from "lucide-react";

import { AppButton } from "@/components/ui/AppButton";
import { AppCard } from "@/components/ui/AppCard";

import { ORDER_DETAILS_COPY } from "../lib/order-details-copy";

export function SupportContactCard() {
  const copy = ORDER_DETAILS_COPY.support;

  return (
    <AppCard id="order-support" className="flex flex-col gap-4">
      <div>
        <h2 className="text-lg font-black tracking-tight text-slate-950">
          {copy.title}
        </h2>
        <p className="mt-2 text-base font-bold leading-relaxed text-slate-500">
          {copy.description}
        </p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <AppButton
          type="button"
          onClick={() => window.open(copy.telegramUrl, "_blank", "noopener,noreferrer")}
          fullWidth
        >
          <Send size={19} />
          {copy.telegramButton}
        </AppButton>
        <AppButton
          type="button"
          variant="secondary"
          onClick={() => {
            window.location.href = copy.phoneHref;
          }}
          fullWidth
        >
          <Phone size={19} />
          {copy.phoneButton}
        </AppButton>
      </div>
      <p className="text-sm font-bold leading-relaxed text-slate-500">
        Telegram {copy.telegramUsername} · {copy.phoneLabel}
      </p>
    </AppCard>
  );
}
