import * as React from "react";
import { Edit3 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { PodcastDialogueTurn } from "@/types/podcast";

export interface ScriptTurnItemProps {
  turn: PodcastDialogueTurn;
  onSeekTo?: (seconds: number) => void;
  onEdit: (turn: PodcastDialogueTurn) => void;
}

export const ScriptTurnItem: React.FC<ScriptTurnItemProps> = ({
  turn,
  onSeekTo,
  onEdit,
}) => {
  const isLead = turn.speaker === "Host 1";

  return (
    <div
      className={`group relative p-3 border transition-colors rounded-none ${
        isLead ? "bg-white border-zinc-200" : "bg-zinc-50 border-zinc-200"
      }`}
    >
      {/* Header Bar */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="h-5 w-5 bg-black text-white text-[10px] font-mono flex items-center justify-center font-bold rounded-none">
            {turn.speaker === "Host 1" ? "1" : "2"}
          </div>
          <span className="text-xs font-bold text-black font-sans">
            {turn.speaker}
          </span>
          <span
            onClick={() => onSeekTo && onSeekTo(turn.timeSeconds)}
            className="text-[11px] font-mono text-zinc-400 hover:text-black cursor-pointer ml-1"
            title="Jump audio to this timestamp"
          >
            [{turn.timestamp}]
          </span>
        </div>

        {/* Edit Button directly on card */}
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

      {/* Spoken Dialogue Text */}
      <p
        onClick={() => onSeekTo && onSeekTo(turn.timeSeconds)}
        className="text-xs text-zinc-800 leading-relaxed pl-7 cursor-pointer hover:text-black transition-colors"
      >
        {turn.text}
      </p>
    </div>
  );
};
