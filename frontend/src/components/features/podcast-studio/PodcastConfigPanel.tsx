import { Mic, Loader2 } from "lucide-react";
import * as React from "react";

import { PodcastFormatSelector } from "./PodcastFormatSelector";
import { VoicePairSelector } from "./VoicePairSelector";

import { Button } from "@/components/ui/Button";
import { Progress } from "@/components/ui/Progress";
import { PodcastFormat, PodcastGenState, VoicePair } from "@/types/podcast";

interface GenerateActionProps {
  isGenerating: boolean;
  progress: number;
  hasEpisode: boolean;
  onGenerate: () => void;
}

const PodcastGenerateAction: React.FC<GenerateActionProps> = ({
  isGenerating,
  progress,
  hasEpisode,
  onGenerate,
}) => {
  if (isGenerating) {
    return (
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
    );
  }

  return (
    <Button
      type="button"
      onClick={onGenerate}
      className="w-full h-10 gap-1.5 bg-black hover:bg-zinc-800 text-white font-medium text-xs rounded-none"
    >
      <Mic className="h-3.5 w-3.5" />
      <span>{hasEpisode ? "Regenerate Podcast" : "Generate Podcast"}</span>
    </Button>
  );
};

export interface PodcastConfigPanelProps {
  selectedPairId: string;
  onSelectPairId: (id: string) => void;
  selectedVoicePair: VoicePair;
  onSelectVoicePair: (pair: VoicePair) => void;
  selectedFormat: PodcastFormat;
  onSelectFormat: (format: PodcastFormat) => void;
  genState: PodcastGenState;
  progress: number;
  error: string | null;
  onGenerate: () => void;
  hasEpisode: boolean;
}

export const PodcastConfigPanel: React.FC<PodcastConfigPanelProps> = ({
  onSelectPairId,
  selectedVoicePair,
  onSelectVoicePair,
  selectedFormat,
  onSelectFormat,
  genState,
  progress,
  error,
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

      <VoicePairSelector
        selectedVoicePair={selectedVoicePair}
        onSelectVoicePair={onSelectVoicePair}
        disabled={isGenerating}
      />

      <PodcastGenerateAction
        isGenerating={isGenerating}
        progress={progress}
        hasEpisode={hasEpisode}
        onGenerate={onGenerate}
      />

      {error && !isGenerating && (
        <p
          role="alert"
          className="p-3 text-xs text-red-700 bg-red-50 border border-red-200 rounded-none"
        >
          {error}
        </p>
      )}
    </div>
  );
};
