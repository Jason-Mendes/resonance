import * as React from "react";

export type ArticleFilter = "all" | "synthesized" | "unsynthesized";

export interface ArticleFilterTabsProps {
  filter: ArticleFilter;
  onFilterChange: (filter: ArticleFilter) => void;
  counts: { all: number; synthesized: number; unsynthesized: number };
}

interface FilterTabOption {
  id: ArticleFilter;
  label: string;
}

const TABS: FilterTabOption[] = [
  { id: "all", label: "All Stories" },
  { id: "synthesized", label: "Synthesized Podcasts" },
  { id: "unsynthesized", label: "Ready to Produce" },
];

export const ArticleFilterTabs: React.FC<ArticleFilterTabsProps> = ({
  filter,
  onFilterChange,
  counts,
}) => (
  <div className="flex items-center gap-1 border-b border-zinc-200">
    {TABS.map((tab) => {
      const active = filter === tab.id;
      const count = counts[tab.id];
      return (
        <button
          key={tab.id}
          type="button"
          onClick={() => onFilterChange(tab.id)}
          className={`flex items-center gap-1.5 px-3 py-2 text-xs font-mono font-medium border-b-2 -mb-px transition-colors cursor-pointer ${
            active
              ? "border-black text-black font-semibold"
              : "border-transparent text-zinc-500 hover:text-black hover:border-zinc-300"
          }`}
        >
          <span>{tab.label}</span>
          <span
            className={`px-1.5 py-0.2 text-[10px] ${
              active ? "bg-black text-white" : "bg-zinc-100 text-zinc-600"
            }`}
          >
            {count}
          </span>
        </button>
      );
    })}
  </div>
);
