import { Bookmark, ChevronDown, ChevronRight } from "lucide-react";
import * as React from "react";

import { PodcastDialogueTurn } from "@/types/podcast";

const PREVIEW_CHARS = 60;

export interface PodcastChapterListProps {
  dialogue: PodcastDialogueTurn[];
  /** Collapses the list, since the transcript is what you follow while playing. */
  isPlaying: boolean;
  onSeek: (seconds: number) => void;
}

export const PodcastChapterList: React.FC<PodcastChapterListProps> = ({
  dialogue,
  isPlaying,
  onSeek,
}) => {
  const [isOpen, setIsOpen] = React.useState<boolean>(false);

  // Playing collapses the list; the reader's attention belongs on the
  // transcript, which tracks the audio.
  React.useEffect(() => {
    if (isPlaying) setIsOpen(false);
  }, [isPlaying]);

  if (dialogue.length === 0) return null;

  return (
    <div className="pt-2 border-t border-zinc-100">
      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        aria-expanded={isOpen}
        className="w-full flex items-center gap-1 text-[10px] font-mono uppercase tracking-wider text-zinc-400 font-semibold hover:text-black transition-colors"
      >
        {isOpen ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
        <Bookmark className="h-3 w-3 text-black" />
        Chapters
        <span className="ml-auto font-sans normal-case tracking-normal">{dialogue.length}</span>
      </button>

      {isOpen && (
        <div className="space-y-0.5 mt-1.5 max-h-[220px] overflow-y-auto">
          {dialogue.map((turn) => (
            <button
              key={turn.id}
              type="button"
              onClick={() => onSeek(turn.timeSeconds)}
              className="w-full flex items-baseline gap-2 text-left text-xs p-1 hover:bg-zinc-50 transition-colors rounded-none"
            >
              <span className="font-mono text-black text-[11px] font-semibold shrink-0">
                {turn.timestamp}
              </span>
              <span className="text-zinc-600 truncate">{turn.text.slice(0, PREVIEW_CHARS)}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
