"use client";

import * as React from "react";

import { ArticleViewer } from "@/components/features/article-viewer";
import { PodcastStudioSidebar } from "@/components/features/podcast-studio";
import { SocialCarouselPanel } from "@/components/features/social-studio";
import { StudioLayout } from "@/components/layout";
import { usePodcastGeneration } from "@/hooks/usePodcastGeneration";
import { Article } from "@/types/article";

export interface ArticleStudioProps {
  article: Article;
}

export const ArticleStudio: React.FC<ArticleStudioProps> = ({ article }) => {
  const {
    selectedPairId,
    setSelectedPairId,
    selectedFormat,
    setSelectedFormat,
    genState,
    progress,
    episode,
    error,
    generatePodcast,
    updateDialogue,
  } = usePodcastGeneration(article);

  return (
    <StudioLayout
      childrenLeft={<ArticleViewer article={article} />}
      childrenRight={
        <>
          <PodcastStudioSidebar
            selectedPairId={selectedPairId}
            onSelectPairId={setSelectedPairId}
            selectedFormat={selectedFormat}
            onSelectFormat={setSelectedFormat}
            genState={genState}
            progress={progress}
            error={error}
            episode={episode}
            onGenerate={generatePodcast}
            onUpdateDialogue={updateDialogue}
          />
          <SocialCarouselPanel article={article} />
        </>
      }
    />
  );
};
