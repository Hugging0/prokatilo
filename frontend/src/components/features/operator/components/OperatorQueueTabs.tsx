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
    <div className="mb-5 flex gap-2 overflow-x-auto pb-1">
      {ORDER_QUEUE_CONFIG.map(({ queue, label }) => (
        <button
          key={queue}
          type="button"
          onClick={() => onQueueChange(queue)}
          className={`rounded-2xl px-4 py-3 text-xs font-black ${
            activeQueue === queue
              ? "bg-white text-slate-900"
              : "bg-white/10 text-white/50"
          }`}
        >
          {label} · {counts[queue]}
        </button>
      ))}
    </div>
  );
}
