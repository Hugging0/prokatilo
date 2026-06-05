import { PackageOpen } from "lucide-react";

import { AppButton } from "@/components/ui/AppButton";
import { AppEmptyState } from "@/components/ui/AppEmptyState";
import { UI_COPY } from "@/lib/copy";

export function EmptyOrdersState({ onOpenCatalog }: { onOpenCatalog: () => void }) {
  return (
    <AppEmptyState
      icon={PackageOpen}
      title={UI_COPY.orders.empty}
      description="Выберите вещь из каталога, а мы привезём её после подтверждения."
      action={
        <AppButton type="button" onClick={onOpenCatalog}>
          Перейти в каталог
        </AppButton>
      }
    />
  );
}
