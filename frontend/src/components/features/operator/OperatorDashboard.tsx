import { LayoutDashboard } from "lucide-react";

import { UI_COPY } from "@/lib/copy";
import {
  ORDER_STATUS_OPTIONS,
  ORDER_STATUSES,
} from "@/lib/order-statuses";
import type { AppOrder, OrderStatus } from "@/types";

interface OperatorDashboardProps {
  orders: AppOrder[];
  onUpdateOrderStatus: (
    orderId: string,
    newStatus: OrderStatus,
  ) => void;
}

export function OperatorDashboard({
  orders,
  onUpdateOrderStatus,
}: OperatorDashboardProps) {
  return (
    <main className="min-h-screen bg-slate-950 px-6 pt-12 pb-32 text-white">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-3xl font-black tracking-tighter leading-none">
            {UI_COPY.operator.title}
          </h2>
          <p className="text-white/40 text-sm font-bold mt-1">
            {UI_COPY.operator.subtitle}
          </p>
        </div>

        <LayoutDashboard className="text-white/30" size={30} />
      </div>

      <h3 className="font-black mb-4">{UI_COPY.operator.title}</h3>

      <div className="space-y-4">
        {orders.map((order) => (
          <article
            key={order.id}
            className="bg-white text-slate-900 rounded-[2rem] p-5"
          >
            <div className="flex items-center gap-4">
              <div
                className={`w-14 h-14 rounded-2xl ${order.bg} ${order.color} flex items-center justify-center`}
              >
                <order.icon size={24} />
              </div>

              <div>
                <h4 className="font-black">{order.title}</h4>
                <p className="text-xs font-bold text-slate-400">
                  {UI_COPY.operator.clientLabel}: {order.userId} •{" "}
                  {order.price}₽
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 mt-5">
              {ORDER_STATUS_OPTIONS.map((status) => (
                <button
                  key={status}
                  type="button"
                  onClick={() =>
                    onUpdateOrderStatus(order.id, status)
                  }
                  className={`px-3 py-2 rounded-xl text-[9px] font-black uppercase transition-all ${
                    order.status === status
                      ? "bg-slate-900 text-white shadow-md"
                      : "bg-slate-100 text-slate-400"
                  }`}
                >
                  {ORDER_STATUSES[status].operatorLabel}
                </button>
              ))}
            </div>
          </article>
        ))}

        {orders.length === 0 && (
          <div className="bg-white/5 rounded-[2rem] p-8 text-center text-white/40 font-bold">
            {UI_COPY.operator.empty}
          </div>
        )}
      </div>
    </main>
  );
}
