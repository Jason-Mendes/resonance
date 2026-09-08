import * as React from "react";
import Image from "next/image";
import { Clock, Calendar, User, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Article } from "@/types/article";

export interface ArticleHeaderProps {
  article: Article;
}

export const ArticleHeader: React.FC<ArticleHeaderProps> = ({ article }) => {
  return (
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

      {/* Author Byline & Date */}
      <div className="flex flex-wrap items-center justify-between gap-4 pt-3 text-xs text-zinc-500 border-t border-zinc-100">
        <div className="flex items-center space-x-2.5">
          {article.author.avatarUrl ? (
            <div className="relative h-8 w-8 overflow-hidden rounded-none ring-1 ring-zinc-200">
              <Image
                src={article.author.avatarUrl}
                alt={article.author.name}
                fill
                className="object-cover"
                unoptimized
              />
            </div>
          ) : (
            <div className="flex h-8 w-8 items-center justify-center rounded-none bg-zinc-100">
              <User className="h-4 w-4 text-zinc-400" />
            </div>
          )}
          <div>
            <p className="font-semibold text-black">{article.author.name}</p>
            <p className="text-[11px] text-zinc-500">{article.author.role}</p>
          </div>
        </div>

        <div className="flex items-center space-x-3 font-mono text-[11px]">
          <span className="flex items-center gap-1">
            <Calendar className="h-3 w-3 text-zinc-400" />
            {article.publishedAt}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3 text-zinc-400" />
            {article.readTimeMinutes} min
          </span>
        </div>
      </div>

      {/* Hero Image */}
      {article.heroImage?.url && (
        <div className="space-y-1.5 pt-1">
          <div className="relative aspect-[16/9] w-full overflow-hidden rounded-none bg-zinc-100 border border-zinc-200">
            <Image
              src={article.heroImage.url}
              alt={article.title}
              fill
              priority
              className="object-cover"
              unoptimized
            />
          </div>
          {(article.heroImage.caption || article.heroImage.credit) && (
            <div className="flex justify-between text-[11px] text-zinc-400 px-0.5">
              <span>{article.heroImage.caption}</span>
              {article.heroImage.credit && <span>{article.heroImage.credit}</span>}
            </div>
          )}
        </div>
      )}
    </header>
  );
};
