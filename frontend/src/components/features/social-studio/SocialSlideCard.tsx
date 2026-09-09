import Image from "next/image";
import * as React from "react";

import { SocialSlideWithImage } from "@/types/social";

export interface SocialSlideCardProps {
  slide: SocialSlideWithImage;
  position: number;
}

/**
 * One swipeable slide: the photograph the article published, and the caption
 * written for it. Square, because that is the frame Instagram gives a carousel.
 */
export const SocialSlideCard: React.FC<SocialSlideCardProps> = ({ slide, position }) => (
  <li className="border border-zinc-200 bg-white">
    <div className="relative aspect-square w-full overflow-hidden bg-zinc-100">
      <Image
        src={slide.image.url}
        alt={slide.image.caption}
        fill
        className="object-cover"
        unoptimized
      />
      <span className="absolute right-2 top-2 bg-black/70 px-2 py-0.5 text-[11px] font-medium text-white">
        {position}
      </span>
    </div>
    <p className="px-3 py-3 text-sm leading-relaxed text-zinc-800">{slide.caption}</p>
  </li>
);
