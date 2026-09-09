import { Clock } from "lucide-react";
import * as React from "react";

import { ArticleCardBadge } from "./ArticleCardBadge";
import { ArticleCardImage } from "./ArticleCardImage";

import { ArticleSummary } from "@/hooks/useArticlesQuery";

export interface ArticleCardProps {
  article: ArticleSummary;
  isSynthesized?: boolean;
  topic?: string;
  onSelect: (id: string) => void;
}

export const ArticleCard: React.FC<ArticleCardProps> = ({
  article,
  isSynthesized = false,
  topic,
  onSelect,
}) => (
  <article
    onClick={() => onSelect(article.id)}
    className="group relative flex flex-col justify-between border border-zinc-200 bg-white p-6 cursor-pointer select-none rounded-none hover:border-black transition-colors"
  >
    <div>
      {article.heroImage?.url && (
        <ArticleCardImage url={article.heroImage.url} alt={article.title} />
      )}

      <div className="flex items-center justify-between text-[11px] font-mono pb-2 border-b border-zinc-100">
        <div className="flex items-center flex-wrap gap-2">
          <span className="uppercase tracking-wider font-semibold text-black">
            {article.kicker}
          </span>
          {isSynthesized && (
            <div className="flex items-center gap-1.5">
              {topic && (
                <span className="inline-flex items-center px-1.5 py-0.5 text-[10px] uppercase font-mono font-semibold bg-zinc-900 text-white">
                  {topic}
                </span>
              )}
              <ArticleCardBadge />
            </div>
          )}
        </div>
        <span className="flex items-center gap-1 text-zinc-400">
          <Clock className="h-3 w-3" />
          {article.readTimeMinutes} min
        </span>
      </div>

      <h3 className="font-serif text-xl font-bold leading-snug text-black mt-3">
        {article.title}
      </h3>

      <p className="text-xs text-zinc-600 line-clamp-3 leading-relaxed mt-2.5">
        {article.subtitle}
      </p>
    </div>

    <div className="pt-4 mt-6 border-t border-zinc-100 text-xs">
      <span className="font-semibold text-black block">{article.author.name}</span>
      <span className="text-[11px] text-zinc-400 font-sans block">{article.author.role}</span>
    </div>
  </article>
);
