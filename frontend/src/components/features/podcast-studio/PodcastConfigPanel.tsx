import * as React from "react";
import { Mic, Loader2, Users } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Progress } from "@/components/ui/Progress";
import { PodcastFormat, PodcastGenState } from "@/types/podcast";

export interface PodcastConfigPanelProps {
  selectedPairId: string;
  onSelectPairId: (id: string) => void;
  selectedFormat: PodcastFormat;
  onSelectFormat: (format: PodcastFormat) => void;
  genState: PodcastGenState;
  progress: number;
  onGenerate: () => void;
  hasEpisode: boolean;
}

export const PodcastConfigPanel: React.FC<PodcastConfigPanelProps> = ({
  onSelectPairId,
  selectedFormat,
  onSelectFormat,
  genState,
  progress,
  onGenerate,
  hasEpisode,
}) => {
  const isGenerating = genState === "generating";

  return (
    <div className="space-y-5">
      {/* Format Selector */}
      <div className="space-y-2">
        <label className="text-[11px] font-mono uppercase tracking-wider text-zinc-500 font-semibold flex items-center gap-1.5">
          <Users className="h-3 w-3 text-black" />
          Format
        </label>
        <div className="grid grid-cols-2 gap-2">
          {[
            { id: "dialogue", label: "Dialogue", sub: "Host 1 & Host 2" },
            { id: "solo", label: "Solo", sub: "Host 1" },
          ].map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                onSelectFormat(item.id as PodcastFormat);
                if (item.id === "dialogue") onSelectPairId("editorial-desk");
                if (item.id === "solo") onSelectPairId("solo-dispatch");
              }}
              className={`p-3 border text-left transition-all rounded-none ${
                selectedFormat === item.id
                  ? "border-black bg-zinc-50 text-black shadow-2xs"
                  : "border-zinc-200 bg-white text-zinc-600 hover:border-zinc-400"
              }`}
            >
              <div className="text-xs font-semibold">{item.label}</div>
              <div className="text-[11px] text-zinc-500 mt-0.5">{item.sub}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Synthesis Trigger */}
      {isGenerating ? (
        <div className="space-y-2 p-3 bg-zinc-50 border border-zinc-200 rounded-none">
          <div className="flex items-center justify-between text-xs text-black font-mono">
            <span className="flex items-center gap-1.5">
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              Synthesizing Audio...
            </span>
            <span className="font-bold">{progress}%</span>
          </div>
          <Progress value={progress} />
        </div>
      ) : (
        <Button
          type="button"
          onClick={onGenerate}
          className="w-full h-10 gap-1.5 bg-black hover:bg-zinc-800 text-white font-medium text-xs rounded-none"
        >
          <Mic className="h-3.5 w-3.5" />
          <span>{hasEpisode ? "Regenerate Audio" : "Generate Audio"}</span>
        </Button>
      )}
    </div>
  );
};
