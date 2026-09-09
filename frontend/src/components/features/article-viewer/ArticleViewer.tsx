import * as React from "react";

import { ArticleBody } from "./ArticleBody";
import { ArticleHeader } from "./ArticleHeader";

import { Badge } from "@/components/ui/Badge";
import { Article } from "@/types/article";

export interface ArticleViewerProps {
  article: Article;
}

export const ArticleViewer: React.FC<ArticleViewerProps> = ({ article }) => {
  return (
    <article className="space-y-6">
      <ArticleHeader article={article} />
      <ArticleBody sections={article.sections} />

      {/* An article an editor added carries no tags, and a "Tags:" label with
          nothing after it reads as something that failed to load. */}
      {article.tags.length > 0 && (
        <footer className="pt-6 mt-8 border-t border-zinc-100">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-mono uppercase tracking-wider text-zinc-400 mr-1">
              Tags:
            </span>
            {article.tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs font-normal">
                #{tag}
              </Badge>
            ))}
          </div>
        </footer>
      )}
    </article>
  );
};
