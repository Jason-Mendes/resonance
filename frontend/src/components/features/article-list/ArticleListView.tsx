import { Loader2, Plus } from "lucide-react";
import * as React from "react";

import { ArticleCard } from "./ArticleCard";

import { Button } from "@/components/ui/Button";
import { ErrorState } from "@/components/ui/ErrorState";
import { useArticlesList } from "@/hooks/useArticlesQuery";

export interface ArticleListViewProps {
  onSelectArticle: (id: string) => void;
  onOpenImport?: () => void;
}

export const ArticleListView: React.FC<ArticleListViewProps> = ({
  onSelectArticle,
  onOpenImport,
}) => {
  const { data: articles, isLoading, isError, refetch } = useArticlesList();

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Editorial Header */}
      <div className="pb-6 border-b border-black flex items-end justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-black">
            Articles
          </h1>
          <p className="text-xs text-zinc-500 mt-1">
            Select an investigation to open text and generate audio dialogue.
          </p>
        </div>

        {onOpenImport && (
          <Button
            variant="outline"
            size="sm"
            onClick={onOpenImport}
            className="shrink-0 gap-1.5 h-8 text-xs border-zinc-300 text-black hover:bg-zinc-50"
          >
            <Plus className="h-3.5 w-3.5" />
            Add article
          </Button>
        )}
      </div>

      {isLoading && (
        <div className="flex flex-col items-center justify-center py-24 space-y-2 text-zinc-400">
          <Loader2 className="h-5 w-5 animate-spin text-black" />
          <span className="text-xs font-mono">Loading articles...</span>
        </div>
      )}

      {isError && <ErrorState message="Failed to load articles." onRetry={() => refetch()} />}

      {articles && articles.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {articles.map((article) => (
            <ArticleCard key={article.id} article={article} onSelect={onSelectArticle} />
          ))}
        </div>
      )}
    </div>
  );
};
