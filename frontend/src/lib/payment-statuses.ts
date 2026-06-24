import type { PaymentStatus } from "@/types";

export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  pending: "Оплата при получении",
  waiting_for_capture: "Оплата при получении",
  succeeded: "Оплачено при получении",
  canceled: "Отменено",
  not_required: "Оплата при получении",
};

export const PAYMENT_STATUS_CLASSES: Record<PaymentStatus, string> = {
  pending: "bg-amber-100 text-amber-700",
  waiting_for_capture: "bg-blue-100 text-blue-700",
  succeeded: "bg-emerald-100 text-emerald-700",
  canceled: "bg-rose-100 text-rose-700",
  not_required: "bg-slate-100 text-slate-600",
};
