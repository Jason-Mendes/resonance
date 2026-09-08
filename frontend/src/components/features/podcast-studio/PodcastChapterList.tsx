import { Bookmark } from "lucide-react";
import * as React from "react";

import { PodcastChapter } from "@/types/podcast";

export interface PodcastChapterListProps {
  chapters: PodcastChapter[];
  onSeek: (seconds: number) => void;
}

export const PodcastChapterList: React.FC<PodcastChapterListProps> = ({ chapters, onSeek }) => (
  <div className="space-y-1 pt-2 border-t border-zinc-100">
    <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 font-semibold flex items-center gap-1">
      <Bookmark className="h-3 w-3 text-black" />
      Chapters
    </span>
    <div className="space-y-0.5">
      {chapters.map((chapter) => (
        <button
          key={chapter.id}
          type="button"
          onClick={() => onSeek(chapter.time)}
          className="w-full flex items-center justify-between text-left text-xs p-1 rounded-none hover:bg-zinc-50 transition-colors"
        >
          <span className="font-mono text-black text-[11px] font-semibold">
            {chapter.formattedTime}
          </span>
          <span className="text-zinc-600 truncate max-w-[200px]">{chapter.title}</span>
        </button>
      ))}
    </div>
  </div>
);
