import { UI_COPY } from "@/lib/copy";
import type { AppOrder } from "@/types";

export function ReviewBlock({
  order,
  onLeaveReview,
}: {
  order: AppOrder;
  onLeaveReview: (orderId: number, rating: number, comment: string) => void;
}) {
  if (order.review) {
    return (
      <section className="rounded-[1.5rem] border border-slate-100 bg-white p-5 text-center shadow-sm">
        <p className="text-base font-black text-slate-950">
          {UI_COPY.orders.reviewThanks}
        </p>
        <p className="mt-2 text-3xl font-black text-amber-400">
          {"★".repeat(order.review.rating)}
        </p>
      </section>
    );
  }

  return (
    <section className="rounded-[1.5rem] border border-amber-100 bg-amber-50 p-5 text-center shadow-sm">
      <p className="text-base font-black text-amber-900">
        {UI_COPY.orders.reviewTitle}
      </p>
      <div className="mt-4 flex justify-center gap-3">
        {[1, 2, 3, 4, 5].map((rating) => (
          <button
            key={rating}
            type="button"
            onClick={() => onLeaveReview(order.id, rating, "")}
            className="text-3xl leading-none text-amber-400 transition active:scale-95"
            aria-label={`Оценить на ${rating}`}
          >
            ★
          </button>
        ))}
      </div>
    </section>
  );
}
