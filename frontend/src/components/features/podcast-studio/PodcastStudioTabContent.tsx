import * as React from "react";

import { PodcastConfigPanel } from "./PodcastConfigPanel";
import { PodcastShowNotes } from "./PodcastShowNotes";
import { PodcastTranscriptView } from "./PodcastTranscriptView";

import {
  PodcastEpisode,
  PodcastFormat,
  PodcastGenState,
  PodcastDialogueTurn,
  VoicePair,
} from "@/types/podcast";

export interface PodcastStudioTabContentProps {
  activeTab: string;
  selectedPairId: string;
  onSelectPairId: (id: string) => void;
  selectedVoicePair: VoicePair;
  onSelectVoicePair: (pair: VoicePair) => void;
  selectedFormat: PodcastFormat;
  onSelectFormat: (format: PodcastFormat) => void;
  genState: PodcastGenState;
  progress: number;
  error: string | null;
  episode: PodcastEpisode | null;
  dialogue: PodcastDialogueTurn[];
  activeTurnId: string | null;
  onSeekTo: (seconds: number) => void;
  onGenerate: () => void;
  onResynthesize?: (dialogue?: PodcastDialogueTurn[]) => void;
  onUpdateDialogue?: (dialogue: PodcastDialogueTurn[]) => void;
}

const EmptyTab: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="text-center py-8 text-xs text-zinc-400">{children}</div>
);

interface TranscriptTabProps {
  episode: PodcastEpisode | null;
  dialogue: PodcastDialogueTurn[];
  activeTurnId: string | null;
  onSeekTo: (seconds: number) => void;
  onResynthesize?: (dialogue?: PodcastDialogueTurn[]) => void;
  onUpdateDialogue?: (dialogue: PodcastDialogueTurn[]) => void;
  isResynthesizing?: boolean;
  progress?: number;
  error?: string | null;
}

const TranscriptTabContent: React.FC<TranscriptTabProps> = ({
  episode,
  dialogue,
  activeTurnId,
  onSeekTo,
  onResynthesize,
  onUpdateDialogue,
  isResynthesizing,
  progress,
  error,
}) => {
  if (!episode) {
    return <EmptyTab>No audio generated yet. Click &quot;Generate Podcast&quot;.</EmptyTab>;
  }
  return (
    <PodcastTranscriptView
      dialogue={dialogue}
      activeTurnId={activeTurnId}
      onSeekTo={onSeekTo}
      onResynthesize={onResynthesize}
      onUpdateDialogue={onUpdateDialogue}
      isResynthesizing={isResynthesizing}
      progress={progress}
      error={error}
    />
  );
};

export const PodcastStudioTabContent: React.FC<PodcastStudioTabContentProps> = (props) => {
  const { activeTab, episode } = props;

  return (
    <div className="pt-1">
      {activeTab === "config" && (
        <PodcastConfigPanel
          selectedPairId={props.selectedPairId}
          onSelectPairId={props.onSelectPairId}
          selectedVoicePair={props.selectedVoicePair}
          onSelectVoicePair={props.onSelectVoicePair}
          selectedFormat={props.selectedFormat}
          onSelectFormat={props.onSelectFormat}
          genState={props.genState}
          progress={props.progress}
          error={props.error}
          onGenerate={props.onGenerate}
          hasEpisode={episode !== null}
        />
      )}

      {activeTab === "transcript" && (
        <TranscriptTabContent
          episode={episode}
          dialogue={props.dialogue}
          activeTurnId={props.activeTurnId}
          onSeekTo={props.onSeekTo}
          onResynthesize={props.onResynthesize}
          onUpdateDialogue={props.onUpdateDialogue}
          isResynthesizing={props.genState === "generating"}
          progress={props.progress}
          error={props.error}
        />
      )}

      {activeTab === "notes" &&
        (episode ? (
          <PodcastShowNotes episode={episode} />
        ) : (
          <EmptyTab>Notes available after generation.</EmptyTab>
        ))}
    </div>
  );
};
