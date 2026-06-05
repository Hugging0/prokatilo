import {
  ORDER_QUEUE_CONFIG,
  type getQueueCounts,
  type OrderQueue,
} from "../lib/operator-queues";

type QueueCounts = ReturnType<typeof getQueueCounts>;

export function OperatorQueueTabs({
  activeQueue,
  counts,
  onQueueChange,
}: {
  activeQueue: OrderQueue;
  counts: QueueCounts;
  onQueueChange: (queue: OrderQueue) => void;
}) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1">
      {ORDER_QUEUE_CONFIG.map(({ queue, label }) => (
        <button
          key={queue}
          type="button"
          onClick={() => onQueueChange(queue)}
          className={`min-h-11 rounded-2xl px-4 text-sm font-black transition ${
            activeQueue === queue
              ? "bg-slate-950 text-white shadow-sm"
              : "border border-slate-200 bg-white text-slate-500"
          }`}
        >
          {label} · {counts[queue]}
        </button>
      ))}
    </div>
  );
}
