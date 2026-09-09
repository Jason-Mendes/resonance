import { Volume2 } from "lucide-react";
import * as React from "react";

import { Badge } from "@/components/ui/Badge";
import { PodcastEpisode } from "@/types/podcast";

export interface PodcastPlayerHeaderProps {
  episode: PodcastEpisode;
}

export const PodcastPlayerHeader: React.FC<PodcastPlayerHeaderProps> = ({ episode }) => (
  <>
    <div className="flex items-start justify-between gap-2">
      <div className="space-y-0.5">
        <div className="flex items-center gap-1.5 flex-wrap">
          <Badge variant="editorial" className="text-[10px] rounded-none">
            {episode.showName}
          </Badge>
          {episode.topic && (
            <span className="text-[10px] font-mono font-semibold uppercase px-1.5 py-0.5 bg-black text-white">
              {episode.topic}
            </span>
          )}
        </div>
        <h3 className="text-sm font-bold text-black leading-tight line-clamp-1">{episode.title}</h3>
      </div>
      <div className="flex items-center gap-1 text-zinc-500 bg-zinc-100 px-2 py-0.5 text-[11px] font-mono shrink-0 rounded-none">
        <Volume2 className="h-3 w-3 text-black" />
        <span>Audio</span>
      </div>
    </div>

    <div className="flex items-center gap-2 pt-1 border-t border-zinc-100">
      <span className="text-[10px] font-mono text-zinc-400 uppercase">Voices:</span>
      <div className="flex items-center gap-2">
        {episode.hosts.map((host, idx) => (
          <div
            key={host.id}
            className="flex items-center gap-1 bg-zinc-50 px-2 py-0.5 border border-zinc-200 rounded-none"
          >
            <span className="text-[10px] font-mono font-bold text-black">H{idx + 1}:</span>
            <span className="text-[11px] font-medium text-black">{host.name}</span>
          </div>
        ))}
      </div>
    </div>
  </>
);
