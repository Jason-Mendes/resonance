import * as React from "react";
import { ArticleSection } from "@/types/article";
import { ArticleTextSection } from "./ArticleTextSection";
import { ArticleQuoteSection } from "./ArticleQuoteSection";
import { ArticleDataCallout } from "./ArticleDataCallout";
import { ArticleKeyPoints } from "./ArticleKeyPoints";
import { ArticleImageSection } from "./ArticleImageSection";

export interface ArticleSectionRendererProps {
  section: ArticleSection;
}

export const ArticleSectionRenderer: React.FC<ArticleSectionRendererProps> = ({
  section,
}) => {
  switch (section.type) {
    case "quote":
      return <ArticleQuoteSection section={section} />;
    case "data-callout":
      return <ArticleDataCallout section={section} />;
    case "key-points":
      return <ArticleKeyPoints section={section} />;
    case "image":
      return <ArticleImageSection section={section} />;
    default:
      return <ArticleTextSection section={section} />;
  }
};
