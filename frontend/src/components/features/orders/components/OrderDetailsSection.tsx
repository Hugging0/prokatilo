import type { ReactNode } from "react";

import { AppCard } from "@/components/ui/AppCard";

export function OrderDetailsSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <AppCard>
      <h2 className="text-lg font-black tracking-tight text-slate-950">
        {title}
      </h2>
      <div className="mt-5 flex flex-col gap-5">{children}</div>
    </AppCard>
  );
}
