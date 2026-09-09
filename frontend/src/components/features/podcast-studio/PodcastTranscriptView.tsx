import { AlertCircle, Loader2 } from "lucide-react";
import * as React from "react";

import { EditTurnModal } from "./EditTurnModal";
import { PodcastTranscriptToolbar } from "./PodcastTranscriptToolbar";
import { ScriptTurnItem } from "./ScriptTurnItem";

import { usePodcastScriptEditor } from "@/hooks/usePodcastScriptEditor";
import { PodcastDialogueTurn } from "@/types/podcast";

export interface PodcastTranscriptViewProps {
  dialogue: PodcastDialogueTurn[];
  activeTurnId: string | null;
  onSeekTo?: (seconds: number) => void;
  onResynthesize?: (dialogue?: PodcastDialogueTurn[]) => void;
  onUpdateDialogue?: (dialogue: PodcastDialogueTurn[]) => void;
  isResynthesizing?: boolean;
  progress?: number;
  error?: string | null;
}

interface StatusBannerProps {
  isResynthesizing: boolean;
  progress: number;
  error: string | null;
}

const TranscriptStatusBanner: React.FC<StatusBannerProps> = ({
  isResynthesizing,
  progress,
  error,
}) => {
  if (isResynthesizing) {
    return (
      <div className="flex items-center gap-2 p-2.5 border border-zinc-200 bg-zinc-50 text-xs font-mono text-zinc-700">
        <Loader2 className="h-3.5 w-3.5 animate-spin text-black shrink-0" />
        <span>Re-synthesizing audio from script ({progress}%)...</span>
      </div>
    );
  }
  if (error) {
    return (
      <div className="flex items-center gap-2 p-2.5 border border-red-200 bg-red-50 text-xs font-mono text-red-700">
        <AlertCircle className="h-3.5 w-3.5 shrink-0 text-red-600" />
        <span>{error}</span>
      </div>
    );
  }
  return null;
};

interface TurnListProps {
  dialogue: PodcastDialogueTurn[];
  activeTurnId: string | null;
  activeRef: React.RefObject<HTMLDivElement>;
  onSeekTo?: (seconds: number) => void;
  onEdit: (turn: PodcastDialogueTurn) => void;
}

const TranscriptTurnList: React.FC<TurnListProps> = ({
  dialogue,
  activeTurnId,
  activeRef,
  onSeekTo,
  onEdit,
}) => (
  <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
    {dialogue.map((turn) => (
      <ScriptTurnItem
        key={turn.id}
        ref={turn.id === activeTurnId ? activeRef : undefined}
        turn={turn}
        isActive={turn.id === activeTurnId}
        onSeekTo={onSeekTo}
        onEdit={onEdit}
      />
    ))}
  </div>
);

export const PodcastTranscriptView: React.FC<PodcastTranscriptViewProps> = ({
  dialogue,
  activeTurnId,
  onSeekTo,
  onResynthesize,
  onUpdateDialogue,
  isResynthesizing = false,
  progress = 0,
  error = null,
}) => {
  const { editingTurn, setEditingTurn, saveTurn, deleteTurn, addTurn } = usePodcastScriptEditor(
    dialogue,
    onUpdateDialogue,
  );
  const activeRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    activeRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [activeTurnId]);

  return (
    <div className="space-y-3">
      <PodcastTranscriptToolbar
        dialogue={dialogue}
        onAddTurn={addTurn}
        onResynthesize={onResynthesize}
        isResynthesizing={isResynthesizing}
      />

      <TranscriptStatusBanner
        isResynthesizing={isResynthesizing}
        progress={progress}
        error={error}
      />

      <TranscriptTurnList
        dialogue={dialogue}
        activeTurnId={activeTurnId}
        activeRef={activeRef}
        onSeekTo={onSeekTo}
        onEdit={setEditingTurn}
      />

      <EditTurnModal
        isOpen={editingTurn !== null}
        turn={editingTurn}
        onClose={() => setEditingTurn(null)}
        onSave={saveTurn}
        onDelete={deleteTurn}
      />
    </div>
  );
};
