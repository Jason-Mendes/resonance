import * as React from "react";

import { PodcastConfigPanel } from "./PodcastConfigPanel";
import { PodcastShowNotes } from "./PodcastShowNotes";
import { PodcastTranscriptView } from "./PodcastTranscriptView";

import {
  PodcastEpisode,
  PodcastFormat,
  PodcastGenState,
  PodcastDialogueTurn,
} from "@/types/podcast";

export interface PodcastStudioTabContentProps {
  activeTab: string;
  selectedPairId: string;
  onSelectPairId: (id: string) => void;
  selectedFormat: PodcastFormat;
  onSelectFormat: (format: PodcastFormat) => void;
  genState: PodcastGenState;
  progress: number;
  error: string | null;
  episode: PodcastEpisode | null;
  onGenerate: () => void;
  onUpdateDialogue?: (dialogue: PodcastDialogueTurn[]) => void;
}

export const PodcastStudioTabContent: React.FC<PodcastStudioTabContentProps> = ({
  activeTab,
  selectedPairId,
  onSelectPairId,
  selectedFormat,
  onSelectFormat,
  genState,
  progress,
  error,
  episode,
  onGenerate,
  onUpdateDialogue,
}) => (
  <div className="pt-1">
    {activeTab === "config" && (
      <PodcastConfigPanel
        selectedPairId={selectedPairId}
        onSelectPairId={onSelectPairId}
        selectedFormat={selectedFormat}
        onSelectFormat={onSelectFormat}
        genState={genState}
        progress={progress}
        error={error}
        onGenerate={onGenerate}
        hasEpisode={episode !== null}
      />
    )}

    {activeTab === "transcript" &&
      (episode ? (
        <PodcastTranscriptView dialogue={episode.dialogue} onUpdateDialogue={onUpdateDialogue} />
      ) : (
        <div className="text-center py-8 text-xs text-zinc-400">
          No audio generated yet. Click &quot;Generate Audio&quot;.
        </div>
      ))}

    {activeTab === "notes" &&
      (episode ? (
        <PodcastShowNotes episode={episode} />
      ) : (
        <div className="text-center py-8 text-xs text-zinc-400">
          Notes available after generation.
        </div>
      ))}
  </div>
);
