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
} from "@/types/podcast";

export interface PodcastStudioSidebarProps {
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

const SIDEBAR_TABS: TabItem[] = [
  { id: "config", label: "Setup", icon: <Sliders className="h-3.5 w-3.5" /> },
  { id: "transcript", label: "Script", icon: <MessageSquare className="h-3.5 w-3.5" /> },
  { id: "notes", label: "Notes", icon: <FileText className="h-3.5 w-3.5" /> },
];

export const PodcastStudioSidebar: React.FC<PodcastStudioSidebarProps> = ({
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
}) => {
  const [activeTab, setActiveTab] = React.useState<string>("config");

  const { playback, dialogue, activeTurnId } = useFollowAlongTranscript(episode);

  React.useEffect(() => {
    if (episode && genState === "completed") {
      setActiveTab("transcript");
    }
  }, [episode, genState]);

  // A failure is reported on the Setup tab, next to the button that caused it.
  React.useEffect(() => {
    if (genState === "error") {
      setActiveTab("config");
    }
  }, [genState]);

  return (
    <div className="space-y-4">
      <PodcastStudioHeader />

      {episode && <PodcastPlayerCard episode={episode} dialogue={dialogue} playback={playback} />}

      <Tabs items={SIDEBAR_TABS} activeId={activeTab} onChange={setActiveTab} />

      <PodcastStudioTabContent
        activeTab={activeTab}
        dialogue={dialogue}
        activeTurnId={activeTurnId}
        onSeekTo={playback.seekTo}
        selectedPairId={selectedPairId}
        onSelectPairId={onSelectPairId}
        selectedFormat={selectedFormat}
        onSelectFormat={onSelectFormat}
        genState={genState}
        progress={progress}
        error={error}
        episode={episode}
        onGenerate={onGenerate}
        onUpdateDialogue={onUpdateDialogue}
      />
    </div>
  );
};
