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
  /** Turns with timings stretched onto the real audio, not the estimate. */
  dialogue: PodcastDialogueTurn[];
  activeTurnId: string | null;
  onSeekTo: (seconds: number) => void;
  onGenerate: () => void;
  onUpdateDialogue?: (dialogue: PodcastDialogueTurn[]) => void;
}

const EmptyTab: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="text-center py-8 text-xs text-zinc-400">{children}</div>
);

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
  dialogue,
  activeTurnId,
  onSeekTo,
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
        <PodcastTranscriptView
          dialogue={dialogue}
          activeTurnId={activeTurnId}
          onSeekTo={onSeekTo}
          onUpdateDialogue={onUpdateDialogue}
        />
      ) : (
        <EmptyTab>No audio generated yet. Click &quot;Generate Audio&quot;.</EmptyTab>
      ))}

    {activeTab === "notes" &&
      (episode ? (
        <PodcastShowNotes episode={episode} />
      ) : (
        <EmptyTab>Notes available after generation.</EmptyTab>
      ))}
  </div>
);
