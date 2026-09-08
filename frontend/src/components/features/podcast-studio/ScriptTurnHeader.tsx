import { Edit3 } from "lucide-react";
import * as React from "react";

import { Button } from "@/components/ui/Button";
import { PodcastDialogueTurn } from "@/types/podcast";

export interface ScriptTurnHeaderProps {
  turn: PodcastDialogueTurn;
  onSeekTo?: (seconds: number) => void;
  onEdit: (turn: PodcastDialogueTurn) => void;
}

export const ScriptTurnHeader: React.FC<ScriptTurnHeaderProps> = ({ turn, onSeekTo, onEdit }) => (
  <div className="flex items-center justify-between mb-2">
    <div className="flex items-center gap-2">
      <div className="h-5 w-5 bg-black text-white text-[10px] font-mono flex items-center justify-center font-bold rounded-none">
        {turn.speaker === "Host 1" ? "1" : "2"}
      </div>
      <span className="text-xs font-bold text-black font-sans">{turn.speaker}</span>
      <span
        onClick={() => onSeekTo && onSeekTo(turn.timeSeconds)}
        className="text-[11px] font-mono text-zinc-400 hover:text-black cursor-pointer ml-1"
        title="Jump audio to this timestamp"
      >
        [{turn.timestamp}]
      </span>
    </div>

    <Button
      variant="outline"
      size="sm"
      onClick={(e) => {
        e.stopPropagation();
        onEdit(turn);
      }}
      className="h-6 px-2 text-[11px] gap-1 border-zinc-200 text-zinc-700 hover:text-black hover:border-black rounded-none"
    >
      <Edit3 className="h-3 w-3" />
      <span>Edit</span>
    </Button>
  </div>
);
