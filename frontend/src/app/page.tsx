"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";
import { Article } from "@/types/article";
import { useArticleDetail } from "@/hooks/useArticlesQuery";
import { usePodcastGeneration } from "@/hooks/usePodcastGeneration";
import { AppHeader, StudioLayout } from "@/components/layout";
import { ArticleListView } from "@/components/features/article-list";
import { ArticleViewer } from "@/components/features/article-viewer";
import { PodcastStudioSidebar } from "@/components/features/podcast-studio";

export default function HomePage() {
  const [selectedArticleId, setSelectedArticleId] = React.useState<string | null>(null);

  // TanStack Query to pull article data by ID
  const { data: fetchedArticle, isLoading: isArticleLoading } =
    useArticleDetail(selectedArticleId);

  const activeArticle: Article | null = fetchedArticle || null;

  const handleSelectArticleFromList = React.useCallback((id: string) => {
    setSelectedArticleId(id);
  }, []);

  const handleBackToList = React.useCallback(() => {
    setSelectedArticleId(null);
  }, []);

  const {
    selectedPairId,
    setSelectedPairId,
    selectedFormat,
    setSelectedFormat,
    genState,
    progress,
    episode,
    generatePodcast,
    updateDialogue,
  } = usePodcastGeneration(activeArticle);

  return (
    <div className="min-h-screen flex flex-col bg-white text-black">
      <AppHeader
        article={activeArticle}
        onBackToList={handleBackToList}
      />

      <main className="flex-1">
        {/* State 1: Loading Article Detail via API */}
        {isArticleLoading && selectedArticleId && (
          <div className="flex flex-col items-center justify-center py-32 space-y-3">
            <Loader2 className="h-6 w-6 animate-spin text-black" />
            <span className="text-xs font-mono text-zinc-500">
              Pulling article data...
            </span>
          </div>
        )}

        {/* State 2: Viewing Selected Article + Podcast Generation */}
        {!isArticleLoading && activeArticle && (
          <StudioLayout
            childrenLeft={<ArticleViewer article={activeArticle} />}
            childrenRight={
              <PodcastStudioSidebar
                selectedPairId={selectedPairId}
                onSelectPairId={setSelectedPairId}
                selectedFormat={selectedFormat}
                onSelectFormat={setSelectedFormat}
                genState={genState}
                progress={progress}
                episode={episode}
                onGenerate={generatePodcast}
                onUpdateDialogue={updateDialogue}
              />
            }
          />
        )}

        {/* State 3: First Page - Article Selection List */}
        {!isArticleLoading && !activeArticle && (
          <ArticleListView
            onSelectArticle={handleSelectArticleFromList}
          />
        )}
      </main>
    </div>
  );
}
