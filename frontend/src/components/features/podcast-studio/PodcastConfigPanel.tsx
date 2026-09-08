import * as React from "react";
import { Mic, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Progress } from "@/components/ui/Progress";
import { PodcastFormat, PodcastGenState } from "@/types/podcast";
import { PodcastFormatSelector } from "./PodcastFormatSelector";

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
      <PodcastFormatSelector
        selectedFormat={selectedFormat}
        onSelectFormat={onSelectFormat}
        onSelectPairId={onSelectPairId}
      />

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
