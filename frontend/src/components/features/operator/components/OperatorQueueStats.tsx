import type { getQueueCounts } from "../lib/operator-queues";

type QueueCounts = ReturnType<typeof getQueueCounts>;

export function OperatorQueueStats({ counts }: { counts: QueueCounts }) {
  return (
    <section className="mb-5 grid grid-cols-3 gap-3">
      <StatCard label="Новые" value={counts.attention} />
      <StatCard label="Сегодня" value={counts.today} />
      <StatCard label="Активные" value={counts.active} />
    </section>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-[1.5rem] bg-white/10 p-4">
      <p className="text-xs font-black uppercase tracking-widest text-white/40">
        {label}
      </p>
      <p className="mt-1 text-2xl font-black">{value}</p>
    </div>
  );
}
