import * as React from "react";

import { EditTurnModal } from "./EditTurnModal";
import { PodcastTranscriptToolbar } from "./PodcastTranscriptToolbar";
import { ScriptTurnItem } from "./ScriptTurnItem";

import { usePodcastScriptEditor } from "@/hooks/usePodcastScriptEditor";
import { PodcastDialogueTurn } from "@/types/podcast";

export interface PodcastTranscriptViewProps {
  dialogue: PodcastDialogueTurn[];
  onSeekTo?: (seconds: number) => void;
  onUpdateDialogue?: (dialogue: PodcastDialogueTurn[]) => void;
}

export const PodcastTranscriptView: React.FC<PodcastTranscriptViewProps> = ({
  dialogue,
  onSeekTo,
  onUpdateDialogue,
}) => {
  const { editingTurn, setEditingTurn, saveTurn, deleteTurn, addTurn } = usePodcastScriptEditor(
    dialogue,
    onUpdateDialogue,
  );

  return (
    <div className="space-y-3">
      <PodcastTranscriptToolbar dialogue={dialogue} onAddTurn={addTurn} />

      <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
        {dialogue.map((turn) => (
          <ScriptTurnItem key={turn.id} turn={turn} onSeekTo={onSeekTo} onEdit={setEditingTurn} />
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
