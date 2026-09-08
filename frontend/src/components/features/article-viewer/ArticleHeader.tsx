import { ExternalLink } from "lucide-react";
import * as React from "react";

import { ArticleByline } from "./ArticleByline";
import { ArticleHeroFigure } from "./ArticleHeroFigure";

import { Badge } from "@/components/ui/Badge";
import { Article } from "@/types/article";

export interface ArticleHeaderProps {
  article: Article;
}

export const ArticleHeader: React.FC<ArticleHeaderProps> = ({ article }) => (
  <header className="space-y-5 pb-6 border-b border-zinc-200">
    {/* Category Kicker */}
    <div className="flex items-center justify-between">
      <Badge variant="editorial">{article.kicker}</Badge>
      {article.sourceUrl && (
        <a
          href={article.sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 text-[11px] font-mono text-zinc-400 hover:text-black transition-colors"
        >
          <span>Source</span>
          <ExternalLink className="h-3 w-3" />
        </a>
      )}
    </div>

    {/* Main Headline & Deck */}
    <div className="space-y-2">
      <h1 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-black leading-snug">
        {article.title}
      </h1>
      {article.subtitle && (
        <p className="text-sm sm:text-base text-zinc-600 font-sans leading-relaxed">
          {article.subtitle}
        </p>
      )}
    </div>

    <ArticleByline
      author={article.author}
      publishedAt={article.publishedAt}
      readTimeMinutes={article.readTimeMinutes}
    />

    <ArticleHeroFigure image={article.heroImage} alt={article.title} />
  </header>
);
