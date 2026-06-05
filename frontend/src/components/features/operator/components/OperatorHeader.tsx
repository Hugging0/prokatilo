import { LayoutDashboard } from "lucide-react";

import { UI_COPY } from "@/lib/copy";

export function OperatorHeader() {
  return (
    <div className="mb-6 flex items-center justify-between">
      <div>
        <h2 className="text-3xl font-black leading-none tracking-tighter">
          {UI_COPY.operator.title}
        </h2>
        <p className="mt-1 text-sm font-bold text-white/40">
          {UI_COPY.operator.subtitle}
        </p>
      </div>

      <LayoutDashboard className="text-white/30" size={30} />
    </div>
  );
}
