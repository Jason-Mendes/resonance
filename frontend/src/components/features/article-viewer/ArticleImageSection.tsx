import Image from "next/image";
import * as React from "react";

import { ArticleSection } from "@/types/article";

export interface ArticleImageSectionProps {
  section: ArticleSection;
}

export const ArticleImageSection: React.FC<ArticleImageSectionProps> = ({ section }) => (
  <div className="my-5 space-y-1.5">
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
      <p className="font-sans text-xs text-zinc-500 text-center">{section.imageCaption}</p>
    )}
  </div>
);
