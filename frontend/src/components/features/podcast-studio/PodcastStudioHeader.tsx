import { Mic } from "lucide-react";
import * as React from "react";

export const PodcastStudioHeader: React.FC = () => (
  <div className="flex items-center justify-between pb-3 border-b border-zinc-200">
    <div>
      <h2 className="text-sm font-bold text-black flex items-center gap-1.5 font-sans">
        <Mic className="h-4 w-4 text-black" />
        Audio Synthesis
      </h2>
      <p className="text-[11px] text-zinc-500 mt-0.5">
        Turn article into conversational audio dialogue
      </p>
    </div>
  </div>
);
