import * as React from "react";

import { ScriptTurnHeader } from "./ScriptTurnHeader";

import { PodcastDialogueTurn } from "@/types/podcast";

export interface ScriptTurnItemProps {
  turn: PodcastDialogueTurn;
  /** True while this turn is the one being spoken. */
  isActive?: boolean;
  onSeekTo?: (seconds: number) => void;
  onEdit: (turn: PodcastDialogueTurn) => void;
}

// forwardRef so the transcript can scroll the spoken turn into view. Function
// components have no DOM node to point at otherwise.
export const ScriptTurnItem = React.forwardRef<HTMLDivElement, ScriptTurnItemProps>(
  ({ turn, isActive = false, onSeekTo, onEdit }, ref) => {
    const isLead = turn.speaker === "Host 1";

    return (
      <div
        ref={ref}
        className={`group relative p-3 border transition-colors rounded-none ${
          isActive
            ? "bg-white border-black shadow-[inset_3px_0_0_0_#000]"
            : `border-zinc-200 ${isLead ? "bg-white" : "bg-zinc-50"}`
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
  },
);

ScriptTurnItem.displayName = "ScriptTurnItem";
