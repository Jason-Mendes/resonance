import { Headphones } from "lucide-react";
import * as React from "react";

export const ArticleCardBadge: React.FC = () => (
  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-mono font-semibold bg-black text-white rounded-none">
    <Headphones className="h-2.5 w-2.5" />
    Synthesized
  </span>
);
