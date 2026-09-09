import * as React from "react";

import { ArticleImageSection } from "./ArticleImageSection";
import { ArticleQuoteSection } from "./ArticleQuoteSection";
import { ArticleTextSection } from "./ArticleTextSection";

import { ArticleSection } from "@/types/article";

export interface ArticleSectionRendererProps {
  section: ArticleSection;
}

export const ArticleSectionRenderer: React.FC<ArticleSectionRendererProps> = ({ section }) => {
  switch (section.type) {
    case "quote":
      return <ArticleQuoteSection section={section} />;
    case "key-points":
      return null;
    case "image":
      return <ArticleImageSection section={section} />;
    default:
      return <ArticleTextSection section={section} />;
  }
};
