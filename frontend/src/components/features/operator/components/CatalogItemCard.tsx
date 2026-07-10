import { EyeOff, Pause, Pencil, RotateCcw, Trash2 } from "lucide-react";

import { AppBadge } from "@/components/ui/AppBadge";
import { AppButton } from "@/components/ui/AppButton";
import { AppCard } from "@/components/ui/AppCard";
import { UI_COPY } from "@/lib/copy";
import type { BackendItemDto } from "@/types";

export function CatalogItemCard({
  item,
  onEdit,
  onArchiveToggle,
  onAvailabilityToggle,
  onDelete,
}: {
  item: BackendItemDto;
  onEdit: () => void;
  onArchiveToggle: () => void;
  onAvailabilityToggle: () => void;
  onDelete: () => void;
}) {
  return (
    <AppCard className="flex flex-col gap-4">
      <div className="flex items-start gap-4">
        {item.image_url ? (
          <div className="size-16 overflow-hidden rounded-2xl bg-slate-100">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={item.image_url}
              alt={item.title}
              className="size-full object-contain"
            />
          </div>
        ) : (
          <div className="flex size-16 items-center justify-center rounded-2xl bg-slate-100 text-xs font-black uppercase text-slate-400">
            {item.icon_key}
          </div>
        )}

        <div className="min-w-0 flex-1">
          <h4 className="text-lg font-black leading-snug text-slate-950">
            {item.title}
          </h4>
          <p className="mt-1 text-base font-bold leading-relaxed text-slate-500">
            {item.category} · от {Number(item.price_per_3h)} ₽
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <AppBadge>{item.is_active ? "В каталоге" : "Скрыт"}</AppBadge>
            <AppBadge>{item.is_available ? "Доступен" : "На паузе"}</AppBadge>
          </div>
        </div>
      </div>

      <div className="grid gap-2 sm:grid-cols-2">
        <AppButton type="button" variant="secondary" onClick={onEdit}>
          <Pencil size={18} />
          {UI_COPY.operator.editItem}
        </AppButton>
        <AppButton type="button" variant="secondary" onClick={onArchiveToggle}>
          {item.is_active ? <EyeOff size={18} /> : <RotateCcw size={18} />}
          {item.is_active
            ? UI_COPY.operator.hideItem
            : UI_COPY.operator.restoreItem}
        </AppButton>
        <AppButton type="button" variant="secondary" onClick={onAvailabilityToggle}>
          <Pause size={18} />
          {item.is_available ? "Пауза аренды" : "Возобновить"}
        </AppButton>
        <AppButton type="button" variant="danger" onClick={onDelete}>
          <Trash2 size={18} />
          {UI_COPY.operator.deleteItem}
        </AppButton>
      </div>
    </AppCard>
  );
}
