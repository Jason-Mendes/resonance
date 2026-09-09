import { Search, X } from "lucide-react";
import * as React from "react";

export interface ArticleSearchBarProps {
  query: string;
  onChange: (query: string) => void;
}

export const ArticleSearchBar: React.FC<ArticleSearchBarProps> = ({ query, onChange }) => (
  <div className="relative flex-1 max-w-sm">
    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400" />
    <input
      type="text"
      value={query}
      onChange={(e) => onChange(e.target.value)}
      placeholder="Search articles by title, topic, author..."
      className="w-full h-9 pl-8 pr-8 text-xs bg-white border border-zinc-200 focus:border-black focus:outline-hidden rounded-none text-black placeholder:text-zinc-400"
    />
    {query.trim().length > 0 && (
      <button
        type="button"
        onClick={() => onChange("")}
        className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 text-zinc-400 hover:text-black"
        aria-label="Clear search"
      >
        <X className="h-3 w-3" />
      </button>
    )}
  </div>
);
