import { UI_COPY } from "@/lib/copy";

import type { OperatorTab } from "../lib/operator-queues";

const TABS: Array<{ tab: OperatorTab; label: string }> = [
  { tab: "orders", label: UI_COPY.operator.title },
  { tab: "catalog", label: UI_COPY.operator.catalogTitle },
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
    <div className="mb-5 flex gap-2 overflow-x-auto pb-1">
      {TABS.map(({ tab, label }) => (
        <button
          key={tab}
          type="button"
          onClick={() => onTabChange(tab)}
          className={`rounded-2xl px-4 py-3 text-xs font-black ${
            activeTab === tab
              ? "bg-white text-slate-900"
              : "bg-white/10 text-white/50"
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
