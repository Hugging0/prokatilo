import type { AppOrder } from "@/types";

import {
  getStatusInfoText,
  getStatusInfoTitle,
} from "../lib/order-status-text";

export function StatusInfoBlock({ order }: { order: AppOrder }) {
  return (
    <section className="rounded-[1.5rem] border border-slate-100 bg-white p-5 shadow-sm">
      <p className="text-base font-black text-slate-950">
        {getStatusInfoTitle(order.status)}
      </p>
      <p className="mt-2 text-base font-bold leading-relaxed text-slate-600">
        {getStatusInfoText(order)}
      </p>
    </section>
  );
}
