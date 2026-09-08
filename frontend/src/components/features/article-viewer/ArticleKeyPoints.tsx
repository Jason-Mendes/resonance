import { CheckCircle2 } from "lucide-react";
import * as React from "react";

import { ArticleSection } from "@/types/article";

export interface ArticleKeyPointsProps {
  section: ArticleSection;
}

export const ArticleKeyPoints: React.FC<ArticleKeyPointsProps> = ({ section }) => (
  <div className="my-5 rounded-none border border-zinc-200 bg-white p-4 font-sans">
    <h3 className="text-xs font-bold uppercase tracking-wider text-black mb-2 font-mono">
      {section.content}
    </h3>
    <ul className="space-y-1.5">
      {section.items?.map((item, idx) => (
        <li key={idx} className="flex items-start gap-2 text-xs text-zinc-700 leading-normal">
          <CheckCircle2 className="h-3.5 w-3.5 text-black shrink-0 mt-0.5" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  </div>
);
