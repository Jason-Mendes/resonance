import { Clock, Calendar, User } from "lucide-react";
import Image from "next/image";
import * as React from "react";

import { ArticleAuthor } from "@/types/article";

export interface ArticleBylineProps {
  author: ArticleAuthor;
  publishedAt: string;
  readTimeMinutes: number;
}

/**
 * Articles carry an ISO timestamp, which is right for storing and sorting and
 * unreadable in a byline. Falls back to the raw string rather than showing
 * "Invalid Date" if a value ever arrives that is not a date.
 */
const formatPublished = (isoDate: string): string => {
  const parsed = new Date(isoDate);
  if (Number.isNaN(parsed.getTime())) return isoDate;

  return parsed.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
};

export const ArticleByline: React.FC<ArticleBylineProps> = ({
  author,
  publishedAt,
  readTimeMinutes,
}) => (
  <div className="flex flex-wrap items-center justify-between gap-4 pt-3 text-xs text-zinc-500 border-t border-zinc-100">
    <div className="flex items-center space-x-2.5">
      {author.avatarUrl ? (
        <div className="relative h-8 w-8 overflow-hidden rounded-none ring-1 ring-zinc-200">
          <Image
            src={author.avatarUrl}
            alt={author.name}
            fill
            className="object-cover"
            unoptimized
          />
        </div>
      ) : (
        <div className="flex h-8 w-8 items-center justify-center rounded-none bg-zinc-100">
          <User className="h-4 w-4 text-zinc-400" />
        </div>
      )}
      <div>
        <p className="font-semibold text-black">{author.name}</p>
        <p className="text-[11px] text-zinc-500">{author.role}</p>
      </div>
    </div>

    <div className="flex items-center space-x-3 font-mono text-[11px]">
      <span className="flex items-center gap-1">
        <Calendar className="h-3 w-3 text-zinc-400" />
        {formatPublished(publishedAt)}
      </span>
      <span className="flex items-center gap-1">
        <Clock className="h-3 w-3 text-zinc-400" />
        {readTimeMinutes} min
      </span>
    </div>
  </div>
);
