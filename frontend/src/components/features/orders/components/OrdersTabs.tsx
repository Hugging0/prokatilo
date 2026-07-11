import type { OrdersTab } from "../types";

const TABS: Array<{ id: OrdersTab; label: string }> = [
  { id: "active", label: "Активные" },
  { id: "completed", label: "История" },
];

export function OrdersTabs({
  activeTab,
  activeCount,
  historyCount,
  onTabChange,
}: {
  activeTab: OrdersTab;
  activeCount: number;
  historyCount: number;
  onTabChange: (tab: OrdersTab) => void;
}) {
  const counts: Record<OrdersTab, number> = {
    active: activeCount,
    completed: historyCount,
  };

  return (
    <div
      className="flex rounded-[1.5rem] border border-slate-100 bg-white p-1 shadow-sm"
      role="tablist"
      aria-label="Брони"
    >
      {TABS.map((tab) => {
        const isActive = activeTab === tab.id;
        const count = counts[tab.id];

        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onTabChange(tab.id)}
            className={`min-h-11 flex-1 rounded-2xl px-3 text-sm font-extrabold transition active:scale-[0.99] ${
              isActive
                ? "bg-slate-950 text-white shadow-sm"
                : "text-slate-500"
            }`}
          >
            {tab.label}
            {count > 0 && ` · ${count}`}
          </button>
        );
      })}
    </div>
  );
}
