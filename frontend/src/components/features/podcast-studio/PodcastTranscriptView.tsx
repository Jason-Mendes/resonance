import * as React from "react";

import { EditTurnModal } from "./EditTurnModal";
import { PodcastTranscriptToolbar } from "./PodcastTranscriptToolbar";
import { ScriptTurnItem } from "./ScriptTurnItem";

import { usePodcastScriptEditor } from "@/hooks/usePodcastScriptEditor";
import { PodcastDialogueTurn } from "@/types/podcast";

export interface PodcastTranscriptViewProps {
  dialogue: PodcastDialogueTurn[];
  /** The turn being spoken, or null when paused. */
  activeTurnId: string | null;
  onSeekTo?: (seconds: number) => void;
  onUpdateDialogue?: (dialogue: PodcastDialogueTurn[]) => void;
}

export const PodcastTranscriptView: React.FC<PodcastTranscriptViewProps> = ({
  dialogue,
  activeTurnId,
  onSeekTo,
  onUpdateDialogue,
}) => {
  const { editingTurn, setEditingTurn, saveTurn, deleteTurn, addTurn } = usePodcastScriptEditor(
    dialogue,
    onUpdateDialogue,
  );
  const activeRef = React.useRef<HTMLDivElement | null>(null);

  // Scrolls within the transcript's own box rather than the page, so following
  // the audio never drags the article beside it.
  React.useEffect(() => {
    activeRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [activeTurnId]);

  return (
    <div className="space-y-3">
      <PodcastTranscriptToolbar dialogue={dialogue} onAddTurn={addTurn} />

      <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
        {dialogue.map((turn) => (
          <ScriptTurnItem
            key={turn.id}
            ref={turn.id === activeTurnId ? activeRef : undefined}
            turn={turn}
            isActive={turn.id === activeTurnId}
            onSeekTo={onSeekTo}
            onEdit={setEditingTurn}
          />
        ))}
      </div>

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
