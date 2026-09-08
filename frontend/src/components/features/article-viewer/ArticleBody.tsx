import * as React from "react";
import { ArticleSection } from "@/types/article";
import { ArticleSectionRenderer } from "./ArticleSectionRenderer";

export interface ArticleBodyProps {
  sections: ArticleSection[];
}

export const ArticleBody: React.FC<ArticleBodyProps> = ({ sections }) => (
  <div className="space-y-6 pt-5 font-serif text-zinc-800 text-base leading-relaxed">
    {sections.map((section) => (
      <ArticleSectionRenderer key={section.id} section={section} />
    ))}
  </div>
);
