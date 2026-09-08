import * as React from "react";
import { TrendingUp } from "lucide-react";
import { ArticleSection } from "@/types/article";

export interface ArticleDataCalloutProps {
  section: ArticleSection;
}

export const ArticleDataCallout: React.FC<ArticleDataCalloutProps> = ({
  section,
}) => (
  <div className="my-5 rounded-none border border-zinc-200 bg-zinc-50 p-4 font-sans">
    <div className="flex items-center justify-between pb-2 border-b border-zinc-200">
      <span className="text-xs font-mono uppercase tracking-wider text-zinc-500 font-semibold">
        {section.content}
      </span>
      <TrendingUp className="h-3.5 w-3.5 text-black" />
    </div>
    {section.dataMetric && (
      <div className="pt-2">
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold font-mono text-black">
            {section.dataMetric.value}
          </span>
          {section.dataMetric.change && (
            <span className="text-[11px] font-semibold px-1.5 py-0.5 rounded-none bg-zinc-200 text-black">
              {section.dataMetric.change}
            </span>
          )}
        </div>
        <p className="mt-0.5 text-xs font-semibold text-black">
          {section.dataMetric.label}
        </p>
      </div>
    )}
  </div>
);
