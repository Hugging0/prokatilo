import { UI_COPY } from "@/lib/copy";

import type { OperatorTab } from "../lib/operator-queues";

const TABS: Array<{ tab: OperatorTab; label: string }> = [
  { tab: "orders", label: UI_COPY.operator.title },
  { tab: "catalog", label: UI_COPY.operator.catalogTitle },
  { tab: "promo-codes", label: UI_COPY.operator.promoCodesTitle },
  { tab: "settings", label: UI_COPY.operator.settingsTitle },
];

export function OperatorTabs({
  activeTab,
  onTabChange,
}: {
  activeTab: OperatorTab;
  onTabChange: (tab: OperatorTab) => void;
}) {
  return (
    <div className="flex gap-2 overflow-x-auto rounded-[1.75rem] border border-slate-100 bg-white p-2 shadow-sm">
      {TABS.map(({ tab, label }) => (
        <button
          key={tab}
          type="button"
          onClick={() => onTabChange(tab)}
          className={`min-h-11 rounded-2xl px-4 text-sm font-black transition ${
            activeTab === tab
              ? "bg-slate-950 text-white"
              : "text-slate-500"
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
