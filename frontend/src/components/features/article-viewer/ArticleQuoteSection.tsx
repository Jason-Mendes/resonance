import * as React from "react";
import { Quote } from "lucide-react";
import { ArticleSection } from "@/types/article";

export interface ArticleQuoteSectionProps {
  section: ArticleSection;
}

export const ArticleQuoteSection: React.FC<ArticleQuoteSectionProps> = ({
  section,
}) => (
  <figure className="my-5 rounded-none bg-zinc-50 border-l-3 border-black p-4">
    <div className="flex items-start gap-2.5">
      <Quote className="h-4 w-4 text-black shrink-0 mt-1" />
      <blockquote className="font-serif italic text-base text-black leading-snug">
        “{section.content}”
      </blockquote>
    </div>
    {section.quoteAuthor && (
      <figcaption className="mt-2 text-right font-sans text-xs text-zinc-500">
        <span className="font-semibold text-black">— {section.quoteAuthor}</span>
        {section.quoteRole && <span>, {section.quoteRole}</span>}
      </figcaption>
    )}
  </figure>
);
