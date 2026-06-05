import { AppCard } from "@/components/ui/AppCard";

export function ReviewRow({
  title,
  value,
  onEdit,
}: {
  title: string;
  value: string;
  onEdit?: () => void;
}) {
  return (
    <AppCard className="flex items-start justify-between gap-4">
      <div>
        <p className="text-xs font-black uppercase tracking-widest text-slate-500">
          {title}
        </p>
        <p className="mt-2 text-base font-bold leading-relaxed text-slate-800">
          {value}
        </p>
      </div>
      {onEdit && (
        <button
          type="button"
          onClick={onEdit}
          className="shrink-0 rounded-xl bg-slate-50 px-3 py-2 text-xs font-black text-slate-600"
        >
          Изменить
        </button>
      )}
    </AppCard>
  );
}
