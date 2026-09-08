"use client";

import { Loader2 } from "lucide-react";
import * as React from "react";

import { ArticleListView } from "@/components/features/article-list";
import { ArticleStudio } from "@/components/features/studio";
import { AppHeader } from "@/components/layout";
import { useArticleDetail } from "@/hooks/useArticlesQuery";
import { Article } from "@/types/article";

export default function HomePage() {
  const [selectedArticleId, setSelectedArticleId] = React.useState<string | null>(null);

  // TanStack Query to pull article data by ID
  const { data: fetchedArticle, isLoading: isArticleLoading } = useArticleDetail(selectedArticleId);

  const activeArticle: Article | null = fetchedArticle || null;

  const handleSelectArticleFromList = React.useCallback((id: string) => {
    setSelectedArticleId(id);
  }, []);

  const handleBackToList = React.useCallback(() => {
    setSelectedArticleId(null);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-white text-black">
      <AppHeader article={activeArticle} onBackToList={handleBackToList} />

      <main className="flex-1">
        {/* State 1: Loading Article Detail via API */}
        {isArticleLoading && selectedArticleId && (
          <div className="flex flex-col items-center justify-center py-32 space-y-3">
            <Loader2 className="h-6 w-6 animate-spin text-black" />
            <span className="text-xs font-mono text-zinc-500">Pulling article data...</span>
          </div>
        )}

        {/* State 2: Viewing Selected Article + Podcast Generation */}
        {!isArticleLoading && activeArticle && <ArticleStudio article={activeArticle} />}

        {/* State 3: First Page - Article Selection List */}
        {!isArticleLoading && !activeArticle && (
          <ArticleListView onSelectArticle={handleSelectArticleFromList} />
        )}
      </main>
    </div>
  );
}
