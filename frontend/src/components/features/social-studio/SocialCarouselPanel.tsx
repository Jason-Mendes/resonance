"use client";

import { Share2 } from "lucide-react";
import * as React from "react";

import { SocialHashtags } from "./SocialHashtags";
import { SocialSlideCard } from "./SocialSlideCard";

import { ActionButton } from "@/components/ui";
import { useSocialCarousel } from "@/hooks/useSocialCarousel";
import { Article } from "@/types/article";

export interface SocialCarouselPanelProps {
  article: Article;
}

/**
 * Turns the article beside it into a social carousel, using the photographs it
 * already published. Nothing is posted anywhere: an editor reviews it here.
 */
export const SocialCarouselPanel: React.FC<SocialCarouselPanelProps> = ({ article }) => {
  const { carousel, generate, isGenerating, error } = useSocialCarousel(article.id);

  return (
    <section className="mt-6 border-t border-zinc-200 pt-6">
      <h2 className="text-sm font-semibold tracking-tight text-zinc-900">Social carousel</h2>
      <p className="mt-1 text-xs leading-relaxed text-zinc-500">
        Captions and hashtags for this story, over the photographs it was published with.
      </p>

      <ActionButton
        label={carousel ? "Regenerate" : "Build carousel"}
        loadingLabel="Writing captions"
        isLoading={isGenerating}
        icon={<Share2 className="h-3.5 w-3.5" />}
        onClick={() => generate()}
        className="mt-4 w-full"
      />

      {error && <p className="mt-3 text-xs leading-relaxed text-red-600">{error}</p>}

      {carousel && (
        <div className="mt-5 space-y-4">
          <p className="whitespace-pre-line text-sm leading-relaxed text-zinc-800">
            {carousel.intro}
          </p>
          <SocialHashtags hashtags={carousel.hashtags} />
          <ul className="space-y-4">
            {carousel.slides.map((slide, index) => (
              <SocialSlideCard key={slide.image.url} slide={slide} position={index + 1} />
            ))}
          </ul>
        </div>
      )}
    </section>
  );
};
