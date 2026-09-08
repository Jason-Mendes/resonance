import Image from "next/image";
import * as React from "react";

export interface ArticleCardImageProps {
  url: string;
  alt: string;
}

export const ArticleCardImage: React.FC<ArticleCardImageProps> = ({ url, alt }) => (
  <div className="relative aspect-[16/10] w-full overflow-hidden bg-zinc-100 rounded-none mb-4 border border-zinc-100">
    <Image src={url} alt={alt} fill className="object-cover" unoptimized />
  </div>
);
