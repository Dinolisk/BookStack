import { STATUS_TABS } from "../constants/bookStatus";

export default function StatusTabs({ activeTab, onTabChange, counts }) {
  return (
    <div
      role="tablist"
      aria-label="Filtrera efter status"
      className="mb-6 flex flex-wrap gap-2"
    >
      {STATUS_TABS.map((tab) => {
        const isActive = activeTab === tab.id;
        const count = counts[tab.id] ?? 0;

        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onTabChange(tab.id)}
            className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
              isActive
                ? "border-sky-500 bg-sky-500/15 text-sky-300"
                : "border-slate-700 bg-slate-900 text-slate-300 hover:border-slate-500 hover:bg-slate-800"
            }`}
          >
            <span>{tab.label}</span>
            <span
              className={`ml-2 rounded-full px-2 py-0.5 text-xs ${
                isActive
                  ? "bg-slate-950/40 text-inherit"
                  : "bg-slate-800 text-slate-400"
              }`}
            >
              {count}
            </span>
          </button>
        );
      })}
    </div>
  );
}
