import { X } from "lucide-react";
import * as React from "react";

import { Button } from "@/components/ui/Button";
import { PodcastDialogueTurn } from "@/types/podcast";

export interface EditTurnHeaderProps {
  turn: PodcastDialogueTurn;
  onClose: () => void;
}

export const EditTurnHeader: React.FC<EditTurnHeaderProps> = ({ turn, onClose }) => (
  <div className="flex items-center justify-between pb-3 border-b border-zinc-200">
    <div>
      <h3 className="font-serif text-lg font-bold text-black">Edit Dialogue Turn</h3>
      <div className="flex items-center gap-2 mt-1">
        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-zinc-100 border border-zinc-200 text-xs font-semibold text-black rounded-none">
          <span className="h-4 w-4 bg-black text-white text-[9px] font-mono flex items-center justify-center font-bold">
            {turn.speaker === "Host 1" ? "1" : "2"}
          </span>
          <span>{turn.speaker}</span>
        </span>
        <span className="text-[11px] font-mono text-zinc-400">[{turn.timestamp}]</span>
      </div>
    </div>

    <Button
      variant="ghost"
      size="icon"
      onClick={onClose}
      className="h-8 w-8 text-zinc-500 hover:text-black rounded-none"
    >
      <X className="h-4 w-4" />
    </Button>
  </div>
);
