import * as React from "react";
import { Badge } from "@/components/ui/Badge";
import { Article } from "@/types/article";
import { ArticleHeader } from "./ArticleHeader";
import { ArticleBody } from "./ArticleBody";

export interface ArticleViewerProps {
  article: Article;
}

export const ArticleViewer: React.FC<ArticleViewerProps> = ({ article }) => {
  return (
    <article className="space-y-6">
      <ArticleHeader article={article} />
      <ArticleBody sections={article.sections} />

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
    </article>
  );
};
