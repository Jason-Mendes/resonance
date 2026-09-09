import { SearchX } from "lucide-react";
import * as React from "react";

export interface ArticleListEmptyStateProps {
  query?: string;
  onClearSearch?: () => void;
}

export const ArticleListEmptyState: React.FC<ArticleListEmptyStateProps> = ({
  query,
  onClearSearch,
}) => (
  <div className="flex flex-col items-center justify-center py-16 px-4 border border-zinc-200 bg-white text-center rounded-none space-y-3">
    <SearchX className="h-8 w-8 text-zinc-400" />
    <div className="space-y-1">
      <h3 className="font-serif text-lg font-bold text-black">No articles found</h3>
      <p className="text-xs text-zinc-500 max-w-sm">
        {query
          ? `No articles match "${query}". Try searching with a different term.`
          : "There are no articles in this category."}
      </p>
    </div>
    {query && onClearSearch && (
      <button
        type="button"
        onClick={onClearSearch}
        className="text-xs font-mono font-semibold underline text-black hover:text-zinc-600 cursor-pointer"
      >
        Clear search filter
      </button>
    )}
  </div>
);
