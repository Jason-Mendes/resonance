import { Sliders, MessageSquare, FileText } from "lucide-react";
import * as React from "react";

import { PodcastPlayerCard } from "./PodcastPlayerCard";
import { PodcastStudioHeader } from "./PodcastStudioHeader";
import { PodcastStudioTabContent } from "./PodcastStudioTabContent";

import { Tabs, TabItem } from "@/components/ui/Tabs";
import { useFollowAlongTranscript } from "@/hooks/useFollowAlongTranscript";
import {
  PodcastEpisode,
  PodcastFormat,
  PodcastGenState,
  PodcastDialogueTurn,
  VoicePair,
} from "@/types/podcast";

export interface PodcastStudioSidebarProps {
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
  onGenerate: () => void;
  onResynthesize?: (dialogue?: PodcastDialogueTurn[]) => void;
  onUpdateDialogue?: (dialogue: PodcastDialogueTurn[]) => void;
}

const SIDEBAR_TABS: TabItem[] = [
  { id: "config", label: "Setup", icon: <Sliders className="h-3.5 w-3.5" /> },
  { id: "transcript", label: "Script", icon: <MessageSquare className="h-3.5 w-3.5" /> },
  { id: "notes", label: "Notes", icon: <FileText className="h-3.5 w-3.5" /> },
];

const useSidebarTabs = (episode: PodcastEpisode | null, genState: PodcastGenState) => {
  const [activeTab, setActiveTab] = React.useState<string>("config");

  React.useEffect(() => {
    if (episode && genState === "completed") {
      setActiveTab("transcript");
    }
  }, [episode, genState]);

  React.useEffect(() => {
    if (genState === "error" && !episode) {
      setActiveTab("config");
    }
  }, [genState, episode]);

  return { activeTab, setActiveTab };
};

export const PodcastStudioSidebar: React.FC<PodcastStudioSidebarProps> = ({
  selectedPairId,
  onSelectPairId,
  selectedVoicePair,
  onSelectVoicePair,
  selectedFormat,
  onSelectFormat,
  genState,
  progress,
  error,
  episode,
  onGenerate,
  onResynthesize,
  onUpdateDialogue,
}) => {
  const { activeTab, setActiveTab } = useSidebarTabs(episode, genState);
  const { playback, dialogue, activeTurnId } = useFollowAlongTranscript(episode);

  return (
    <div className="space-y-4">
      <PodcastStudioHeader />

      {episode && <PodcastPlayerCard episode={episode} playback={playback} />}

      <Tabs items={SIDEBAR_TABS} activeId={activeTab} onChange={setActiveTab} />

      <PodcastStudioTabContent
        activeTab={activeTab}
        dialogue={dialogue}
        activeTurnId={activeTurnId}
        onSeekTo={playback.seekTo}
        selectedPairId={selectedPairId}
        onSelectPairId={onSelectPairId}
        selectedVoicePair={selectedVoicePair}
        onSelectVoicePair={onSelectVoicePair}
        selectedFormat={selectedFormat}
        onSelectFormat={onSelectFormat}
        genState={genState}
        progress={progress}
        error={error}
        episode={episode}
        onGenerate={onGenerate}
        onResynthesize={onResynthesize}
        onUpdateDialogue={onUpdateDialogue}
      />
    </div>
  );
};
