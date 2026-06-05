import type { OrdersTab } from "../types";

const TABS: Array<{ id: OrdersTab; label: string }> = [
  { id: "active", label: "Активные" },
  { id: "completed", label: "Завершённые" },
  { id: "all", label: "Все" },
];

export function OrdersTabs({
  activeTab,
  onTabChange,
}: {
  activeTab: OrdersTab;
  onTabChange: (tab: OrdersTab) => void;
}) {
  return (
    <div className="flex rounded-[1.5rem] border border-slate-100 bg-white p-1 shadow-sm">
      {TABS.map((tab) => (
        <button
          key={tab.id}
          type="button"
          onClick={() => onTabChange(tab.id)}
          className={`min-h-11 flex-1 rounded-2xl px-3 text-sm font-extrabold transition ${
            activeTab === tab.id
              ? "bg-slate-950 text-white shadow-sm"
              : "text-slate-500"
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
