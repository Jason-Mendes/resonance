import * as React from "react";

import { ArticleSection, ArticleSectionType } from "@/types/article";

interface TextSectionStyle {
  as: React.ElementType;
  className: string;
}

const PARAGRAPH_STYLE: TextSectionStyle = {
  as: "p",
  className: "text-zinc-800",
};

/** Section types that render as a single block of text, keyed by type. */
const TEXT_SECTION_STYLES: Partial<Record<ArticleSectionType, TextSectionStyle>> = {
  lead: {
    as: "p",
    className:
      "font-serif text-lg font-normal text-black leading-relaxed border-l-2 border-black pl-4 py-0.5",
  },
  heading: {
    as: "h2",
    className: "font-sans font-bold text-lg text-black pt-3 pb-1 tracking-tight",
  },
  question: {
    as: "p",
    className: "font-sans font-semibold text-black text-sm pt-2",
  },
  answer: {
    as: "p",
    className: "text-zinc-800 leading-relaxed pl-2 border-l border-zinc-200",
  },
  infobox: {
    as: "div",
    className:
      "my-5 rounded-none border border-zinc-200 bg-zinc-50 p-4 font-sans text-xs text-zinc-700 leading-relaxed",
  },
  paragraph: PARAGRAPH_STYLE,
};

export interface ArticleTextSectionProps {
  section: ArticleSection;
}

export const ArticleTextSection: React.FC<ArticleTextSectionProps> = ({ section }) => {
  const { as: Tag, className } = TEXT_SECTION_STYLES[section.type] ?? PARAGRAPH_STYLE;

  return <Tag className={className}>{section.content}</Tag>;
};
