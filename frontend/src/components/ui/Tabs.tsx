import * as React from "react";

import { cn } from "@/lib/utils";

export interface TabItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  badge?: string;
}

export interface TabsProps {
  items: TabItem[];
  activeId: string;
  onChange: (id: string) => void;
  className?: string;
}

export const Tabs: React.FC<TabsProps> = ({ items, activeId, onChange, className }) => {
  return (
    <div
      className={cn(
        "flex items-center space-x-1 rounded-none bg-zinc-100 p-1 border border-zinc-200",
        className,
      )}
    >
      {items.map((item) => {
        const isActive = item.id === activeId;
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => onChange(item.id)}
            className={cn(
              "flex flex-1 items-center justify-center gap-1.5 rounded-none px-3 py-1.5 text-xs font-medium transition-all select-none",
              isActive
                ? "bg-white text-black font-semibold border border-zinc-200"
                : "text-zinc-500 hover:text-black border border-transparent",
            )}
          >
            {item.icon}
            <span>{item.label}</span>
            {item.badge && (
              <span className="ml-1 rounded-none bg-zinc-200 px-1.5 py-0.2 text-[10px] font-semibold text-black">
                {item.badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};
