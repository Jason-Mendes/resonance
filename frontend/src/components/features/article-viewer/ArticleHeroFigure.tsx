import Image from "next/image";
import * as React from "react";

import { ArticleHeroImage } from "@/types/article";

export interface ArticleHeroFigureProps {
  /** Absent on articles an editor added without one, which renders nothing. */
  image: ArticleHeroImage | undefined;
  alt: string;
}

export const ArticleHeroFigure: React.FC<ArticleHeroFigureProps> = ({ image, alt }) => {
  if (!image?.url) return null;

  return (
    <div className="space-y-1.5 pt-1">
      <div className="relative aspect-[16/9] w-full overflow-hidden rounded-none bg-zinc-100 border border-zinc-200">
        <Image src={image.url} alt={alt} fill priority className="object-cover" unoptimized />
      </div>
      {(image.caption || image.credit) && (
        <div className="flex justify-between text-[11px] text-zinc-400 px-0.5">
          <span>{image.caption}</span>
          {image.credit && <span>{image.credit}</span>}
        </div>
      )}
    </div>
  );
};
