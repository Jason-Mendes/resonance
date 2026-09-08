import * as React from "react";

import { ScriptTurnHeader } from "./ScriptTurnHeader";

import { PodcastDialogueTurn } from "@/types/podcast";

export interface ScriptTurnItemProps {
  turn: PodcastDialogueTurn;
  onSeekTo?: (seconds: number) => void;
  onEdit: (turn: PodcastDialogueTurn) => void;
}

export const ScriptTurnItem: React.FC<ScriptTurnItemProps> = ({ turn, onSeekTo, onEdit }) => {
  const isLead = turn.speaker === "Host 1";

  return (
    <div
      className={`group relative p-3 border transition-colors rounded-none ${
        isLead ? "bg-white border-zinc-200" : "bg-zinc-50 border-zinc-200"
      }`}
    >
      <ScriptTurnHeader turn={turn} onSeekTo={onSeekTo} onEdit={onEdit} />

      <p
        onClick={() => onSeekTo && onSeekTo(turn.timeSeconds)}
        className="text-xs text-zinc-800 leading-relaxed pl-7 cursor-pointer hover:text-black transition-colors"
      >
        {turn.text}
      </p>
    </div>
  );
};
