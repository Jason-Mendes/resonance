import { CheckCircle2, FileText } from "lucide-react";
import * as React from "react";

import { PodcastEpisode } from "@/types/podcast";

export interface PodcastNotesCardProps {
  episode: PodcastEpisode;
}

export const PodcastNotesCard: React.FC<PodcastNotesCardProps> = ({ episode }) => (
  <div className="border border-zinc-200 bg-white p-3.5 space-y-2.5 rounded-none">
    <div className="flex items-center gap-1.5 text-xs font-mono font-semibold text-zinc-500 uppercase tracking-wider">
      <FileText className="h-3.5 w-3.5 text-black" />
      <span>Notes</span>
    </div>
    {episode.showNotes ? (
      <p className="text-xs text-zinc-700 leading-relaxed">{episode.showNotes}</p>
    ) : (
      <p className="text-xs text-zinc-400">Notes are written while the audio renders.</p>
    )}

    {/* The heading appears only with points under it, rather than labelling
        nothing while the reading layers are still being written. */}
    {episode.keyTakeaways.length > 0 && (
      <div className="pt-2 border-t border-zinc-100 space-y-1.5">
        <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 font-semibold">
          Key Points:
        </span>
        <ul className="space-y-1">
          {episode.keyTakeaways.map((takeaway) => (
            <li key={takeaway} className="flex items-start gap-1.5 text-xs text-zinc-600">
              <CheckCircle2 className="h-3 w-3 text-black shrink-0 mt-0.5" />
              <span>{takeaway}</span>
            </li>
          ))}
        </ul>
      </div>
    )}
  </div>
);
