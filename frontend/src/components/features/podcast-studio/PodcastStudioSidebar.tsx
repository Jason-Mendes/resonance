import * as React from "react";
import { Sliders, MessageSquare, FileText } from "lucide-react";
import { Tabs, TabItem } from "@/components/ui/Tabs";
import {
  PodcastEpisode,
  PodcastFormat,
  PodcastGenState,
  PodcastDialogueTurn,
} from "@/types/podcast";
import { PodcastPlayerCard } from "./PodcastPlayerCard";
import { PodcastStudioHeader } from "./PodcastStudioHeader";
import { PodcastStudioTabContent } from "./PodcastStudioTabContent";

export interface PodcastStudioSidebarProps {
  selectedPairId: string;
  onSelectPairId: (id: string) => void;
  selectedFormat: PodcastFormat;
  onSelectFormat: (format: PodcastFormat) => void;
  genState: PodcastGenState;
  progress: number;
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
  episode,
  onGenerate,
  onUpdateDialogue,
}) => {
  const [activeTab, setActiveTab] = React.useState<string>("config");

  React.useEffect(() => {
    if (episode && genState === "completed") {
      setActiveTab("transcript");
    }
  }, [episode, genState]);

  return (
    <div className="space-y-4">
      <PodcastStudioHeader />

      {episode && <PodcastPlayerCard episode={episode} />}

      <Tabs items={SIDEBAR_TABS} activeId={activeTab} onChange={setActiveTab} />

      <PodcastStudioTabContent
        activeTab={activeTab}
        selectedPairId={selectedPairId}
        onSelectPairId={onSelectPairId}
        selectedFormat={selectedFormat}
        onSelectFormat={onSelectFormat}
        genState={genState}
        progress={progress}
        episode={episode}
        onGenerate={onGenerate}
        onUpdateDialogue={onUpdateDialogue}
      />
    </div>
  );
};
