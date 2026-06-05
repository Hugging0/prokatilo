import type { getQueueCounts } from "../lib/operator-queues";

type QueueCounts = ReturnType<typeof getQueueCounts>;

export function OperatorQueueStats({ counts }: { counts: QueueCounts }) {
  return (
    <section className="grid grid-cols-3 gap-3">
      <StatCard label="Новые" value={counts.attention} />
      <StatCard label="Сегодня" value={counts.today} />
      <StatCard label="В работе" value={counts.active} />
    </section>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-[1.5rem] border border-slate-100 bg-white p-4 shadow-sm">
      <p className="text-xs font-black uppercase tracking-widest text-slate-500">
        {label}
      </p>
      <p className="mt-1 text-2xl font-black text-slate-950">{value}</p>
    </div>
  );
}
