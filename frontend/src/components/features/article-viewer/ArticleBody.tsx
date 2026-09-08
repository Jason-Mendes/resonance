import * as React from "react";
import Image from "next/image";
import { Quote, CheckCircle2, TrendingUp } from "lucide-react";
import { ArticleSection } from "@/types/article";

export interface ArticleBodyProps {
  sections: ArticleSection[];
}

export const ArticleBody: React.FC<ArticleBodyProps> = ({ sections }) => {
  return (
    <div className="space-y-6 pt-5 font-serif text-zinc-800 text-base leading-relaxed">
      {sections.map((section) => {
        switch (section.type) {
          case "lead":
            return (
              <p
                key={section.id}
                className="font-serif text-lg font-normal text-black leading-relaxed border-l-2 border-black pl-4 py-0.5"
              >
                {section.content}
              </p>
            );

          case "heading":
            return (
              <h2
                key={section.id}
                className="font-sans font-bold text-lg text-black pt-3 pb-1 tracking-tight"
              >
                {section.content}
              </h2>
            );

          case "quote":
            return (
              <figure
                key={section.id}
                className="my-5 rounded-none bg-zinc-50 border-l-3 border-black p-4"
              >
                <div className="flex items-start gap-2.5">
                  <Quote className="h-4 w-4 text-black shrink-0 mt-1" />
                  <blockquote className="font-serif italic text-base text-black leading-snug">
                    “{section.content}”
                  </blockquote>
                </div>
                {section.quoteAuthor && (
                  <figcaption className="mt-2 text-right font-sans text-xs text-zinc-500">
                    <span className="font-semibold text-black">
                      — {section.quoteAuthor}
                    </span>
                    {section.quoteRole && <span>, {section.quoteRole}</span>}
                  </figcaption>
                )}
              </figure>
            );

          case "data-callout":
            return (
              <div
                key={section.id}
                className="my-5 rounded-none border border-zinc-200 bg-zinc-50 p-4 font-sans"
              >
                <div className="flex items-center justify-between pb-2 border-b border-zinc-200">
                  <span className="text-xs font-mono uppercase tracking-wider text-zinc-500 font-semibold">
                    {section.content}
                  </span>
                  <TrendingUp className="h-3.5 w-3.5 text-black" />
                </div>
                {section.dataMetric && (
                  <div className="pt-2">
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-bold font-mono text-black">
                        {section.dataMetric.value}
                      </span>
                      {section.dataMetric.change && (
                        <span className="text-[11px] font-semibold px-1.5 py-0.5 rounded-none bg-zinc-200 text-black">
                          {section.dataMetric.change}
                        </span>
                      )}
                    </div>
                    <p className="mt-0.5 text-xs font-semibold text-black">
                      {section.dataMetric.label}
                    </p>
                  </div>
                )}
              </div>
            );

          case "key-points":
            return (
              <div
                key={section.id}
                className="my-5 rounded-none border border-zinc-200 bg-white p-4 font-sans"
              >
                <h3 className="text-xs font-bold uppercase tracking-wider text-black mb-2 font-mono">
                  {section.content}
                </h3>
                <ul className="space-y-1.5">
                  {section.items?.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-xs text-zinc-700 leading-normal">
                      <CheckCircle2 className="h-3.5 w-3.5 text-black shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            );

          case "image":
            return (
              <div key={section.id} className="my-5 space-y-1.5">
                {section.imageUrl && (
                  <div className="relative aspect-[16/9] w-full overflow-hidden rounded-none bg-zinc-100 border border-zinc-200">
                    <Image
                      src={section.imageUrl}
                      alt={section.imageCaption || "Article image"}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  </div>
                )}
                {section.imageCaption && (
                  <p className="font-sans text-xs text-zinc-500 text-center">
                    {section.imageCaption}
                  </p>
                )}
              </div>
            );

          case "question":
            return (
              <p key={section.id} className="font-sans font-semibold text-black text-sm pt-2">
                {section.content}
              </p>
            );

          case "answer":
            return (
              <p key={section.id} className="text-zinc-800 leading-relaxed pl-2 border-l border-zinc-200">
                {section.content}
              </p>
            );

          case "infobox":
            return (
              <div key={section.id} className="my-5 rounded-none border border-zinc-200 bg-zinc-50 p-4 font-sans text-xs text-zinc-700 leading-relaxed">
                {section.content}
              </div>
            );

          default:
            return (
              <p key={section.id} className="text-zinc-800">
                {section.content}
              </p>
            );
        }
      })}
    </div>
  );
};
