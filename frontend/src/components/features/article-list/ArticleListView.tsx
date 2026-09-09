import { Loader2, Plus } from "lucide-react";
import * as React from "react";

import { calculateFilterCounts, calculateTopicCounts, filterArticles } from "./article-filters";
import { ArticleCard } from "./ArticleCard";
import { ArticleCategoryFilter } from "./ArticleCategoryFilter";
import { ArticleFilter, ArticleFilterTabs } from "./ArticleFilterTabs";
import { ArticleListEmptyState } from "./ArticleListEmptyState";
import { ArticleSearchBar } from "./ArticleSearchBar";

import { Button } from "@/components/ui/Button";
import { ErrorState } from "@/components/ui/ErrorState";
import { ArticleSummary, useArticlesList } from "@/hooks/useArticlesQuery";
import { useSynthesizedArticles } from "@/hooks/useSynthesizedArticles";

export interface ArticleListViewProps {
  onSelectArticle: (id: string) => void;
  onOpenImport?: () => void;
}

const ArticleListHeader: React.FC<{ onOpenImport?: () => void }> = ({ onOpenImport }) => (
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
);

interface ArticleGridProps {
  articles: ArticleSummary[];
  isSynthesized: (id: string) => boolean;
  getTopic: (id: string) => string | undefined;
  onSelect: (id: string) => void;
}

const ArticleListGrid: React.FC<ArticleGridProps> = ({
  articles,
  isSynthesized,
  getTopic,
  onSelect,
}) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {articles.map((article) => {
      const synthesized = isSynthesized(article.id);
      return (
        <ArticleCard
          key={article.id}
          article={article}
          isSynthesized={synthesized}
          topic={synthesized ? getTopic(article.id) : undefined}
          onSelect={onSelect}
        />
      );
    })}
  </div>
);

interface UseArticleFilteringProps {
  articles: ArticleSummary[] | undefined;
  isSynthesized: (id: string) => boolean;
  getTopic: (id: string) => string | undefined;
  availableTopics: string[];
}

const useArticleFiltering = ({
  articles,
  isSynthesized,
  getTopic,
  availableTopics,
}: UseArticleFilteringProps) => {
  const [searchQuery, setSearchQuery] = React.useState("");
  const [filter, setFilter] = React.useState<ArticleFilter>("all");
  const [selectedTopic, setSelectedTopic] = React.useState<string>("all");

  const topicsList = React.useMemo(() => {
    if (filter === "unsynthesized") return [];
    return availableTopics;
  }, [availableTopics, filter]);

  const filtered = React.useMemo(
    () =>
      filterArticles(articles, {
        query: searchQuery,
        filter,
        isSynthesized,
        selectedTopic,
        getTopic,
      }),
    [articles, searchQuery, filter, isSynthesized, selectedTopic, getTopic],
  );

  const counts = React.useMemo(
    () => calculateFilterCounts(articles, searchQuery, isSynthesized),
    [articles, searchQuery, isSynthesized],
  );

  const topicCounts = React.useMemo(
    () => calculateTopicCounts(articles, getTopic),
    [articles, getTopic],
  );

  return {
    searchQuery,
    setSearchQuery,
    filter,
    setFilter,
    selectedTopic,
    setSelectedTopic,
    topicsList,
    filtered,
    counts,
    topicCounts,
  };
};

export const ArticleListView: React.FC<ArticleListViewProps> = ({
  onSelectArticle,
  onOpenImport,
}) => {
  const { data: articles, isLoading, isError, refetch } = useArticlesList();
  const { isSynthesized, getTopic, availableTopics } = useSynthesizedArticles();
  const {
    searchQuery,
    setSearchQuery,
    filter,
    setFilter,
    selectedTopic,
    setSelectedTopic,
    topicsList,
    filtered,
    counts,
    topicCounts,
  } = useArticleFiltering({ articles, isSynthesized, getTopic, availableTopics });

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <ArticleListHeader onOpenImport={onOpenImport} />

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <ArticleFilterTabs filter={filter} onFilterChange={setFilter} counts={counts} />
        <ArticleSearchBar query={searchQuery} onChange={setSearchQuery} />
      </div>

      <ArticleCategoryFilter
        selectedTopic={selectedTopic}
        onSelectTopic={setSelectedTopic}
        topics={topicsList}
        counts={topicCounts}
      />

      {isLoading && (
        <div className="flex flex-col items-center justify-center py-24 space-y-2 text-zinc-400">
          <Loader2 className="h-5 w-5 animate-spin text-black" />
          <span className="text-xs font-mono">Loading articles...</span>
        </div>
      )}

      {isError && <ErrorState message="Failed to load articles." onRetry={() => refetch()} />}

      {!isLoading && !isError && filtered.length === 0 && (
        <ArticleListEmptyState query={searchQuery} onClearSearch={() => setSearchQuery("")} />
      )}

      {!isLoading && !isError && filtered.length > 0 && (
        <ArticleListGrid
          articles={filtered}
          isSynthesized={isSynthesized}
          getTopic={getTopic}
          onSelect={onSelectArticle}
        />
      )}
    </div>
  );
};
