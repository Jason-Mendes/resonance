import * as React from "react";
import { Mic, Sliders, MessageSquare, FileText } from "lucide-react";
import { Tabs, TabItem } from "@/components/ui/Tabs";
import {
  PodcastEpisode,
  PodcastFormat,
  PodcastGenState,
  PodcastDialogueTurn,
} from "@/types/podcast";
import { PodcastConfigPanel } from "./PodcastConfigPanel";
import { PodcastPlayerCard } from "./PodcastPlayerCard";
import { PodcastTranscriptView } from "./PodcastTranscriptView";
import { PodcastShowNotes } from "./PodcastShowNotes";

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
      {/* Sidebar Header */}
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

      {/* Audio Player */}
      {episode && <PodcastPlayerCard episode={episode} />}

      {/* Tabs */}
      <Tabs
        items={SIDEBAR_TABS}
        activeId={activeTab}
        onChange={setActiveTab}
      />

      {/* Content */}
      <div className="pt-1">
        {activeTab === "config" && (
          <PodcastConfigPanel
            selectedPairId={selectedPairId}
            onSelectPairId={onSelectPairId}
            selectedFormat={selectedFormat}
            onSelectFormat={onSelectFormat}
            genState={genState}
            progress={progress}
            onGenerate={onGenerate}
            hasEpisode={episode !== null}
          />
        )}

        {activeTab === "transcript" && (
          episode ? (
            <PodcastTranscriptView
              dialogue={episode.dialogue}
              onUpdateDialogue={onUpdateDialogue}
            />
          ) : (
            <div className="text-center py-8 text-xs text-zinc-400">
              No audio generated yet. Click &quot;Generate Audio&quot;.
            </div>
          )
        )}

        {activeTab === "notes" && (
          episode ? (
            <PodcastShowNotes episode={episode} />
          ) : (
            <div className="text-center py-8 text-xs text-zinc-400">
              Notes available after generation.
            </div>
          )
        )}
      </div>
    </div>
  );
};
