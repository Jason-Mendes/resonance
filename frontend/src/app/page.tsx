"use client";

import * as React from "react";

import { ArticleDialogs } from "@/components/features/article-input";
import { ArticleListView } from "@/components/features/article-list";
import { ArticleStudio } from "@/components/features/studio";
import { AppHeader } from "@/components/layout";
import { LoadingState } from "@/components/ui";
import { useArticleDetail } from "@/hooks/useArticlesQuery";
import { Article } from "@/types/article";

export default function HomePage() {
  const [selectedArticleId, setSelectedArticleId] = React.useState<string | null>(null);
  const [isAddOpen, setIsAddOpen] = React.useState<boolean>(false);
  const [isEditOpen, setIsEditOpen] = React.useState<boolean>(false);

  // A saved article opens straight into the studio, so an editor lands where
  // they can generate from what they just added rather than back at the grid.
  const handleArticleSaved = React.useCallback((article: Article) => {
    setIsAddOpen(false);
    setSelectedArticleId(article.id);
  }, []);

  // An edit closes the form and leaves the editor on the article, where the
  // reader now shows the new text and Generate rebuilds the audio from it.
  const handleArticleEdited = React.useCallback(() => {
    setIsEditOpen(false);
  }, []);

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
      <AppHeader
        article={activeArticle}
        onBackToList={handleBackToList}
        onEditArticle={() => setIsEditOpen(true)}
      />

      <main className="flex-1">
        {isArticleLoading && selectedArticleId && (
          <LoadingState message="Pulling article data..." />
        )}

        {!isArticleLoading && activeArticle && <ArticleStudio article={activeArticle} />}

        {!isArticleLoading && !activeArticle && (
          <ArticleListView
            onSelectArticle={handleSelectArticleFromList}
            onOpenImport={() => setIsAddOpen(true)}
          />
        )}
      </main>

      <ArticleDialogs
        isAddOpen={isAddOpen}
        isEditOpen={isEditOpen}
        article={activeArticle}
        onCloseAdd={() => setIsAddOpen(false)}
        onCloseEdit={() => setIsEditOpen(false)}
        onAdded={handleArticleSaved}
        onEdited={handleArticleEdited}
      />
    </div>
  );
}
