import * as React from "react";
import { Copy, Check, MessageSquare, Plus } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { PodcastDialogueTurn } from "@/types/podcast";
import { ScriptTurnItem } from "./ScriptTurnItem";
import { EditTurnModal } from "./EditTurnModal";

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
  const [copied, setCopied] = React.useState(false);
  const [editingTurn, setEditingTurn] = React.useState<PodcastDialogueTurn | null>(null);

  const handleCopy = () => {
    const full = dialogue
      .map((t) => `[${t.timestamp}] ${t.speaker}:\n${t.text}`)
      .join("\n\n");
    navigator.clipboard.writeText(full);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveTurn = (updatedTurn: PodcastDialogueTurn) => {
    const updated = dialogue.map((t) =>
      t.id === updatedTurn.id ? updatedTurn : t
    );
    if (onUpdateDialogue) {
      onUpdateDialogue(updated);
    }
  };

  const handleDeleteTurn = (id: string) => {
    const updated = dialogue.filter((t) => t.id !== id);
    if (onUpdateDialogue) {
      onUpdateDialogue(updated);
    }
  };

  const handleAddNewTurn = () => {
    const lastTurn = dialogue[dialogue.length - 1];
    const nextSpeaker = lastTurn?.speaker === "Host 1" ? "Host 2" : "Host 1";
    const nextSeconds = (lastTurn?.timeSeconds || 0) + 20;
    const mins = Math.floor(nextSeconds / 60);
    const secs = nextSeconds % 60;
    const formatted = `${mins}:${secs < 10 ? "0" : ""}${secs}`;

    const newTurn: PodcastDialogueTurn = {
      id: `turn-${Date.now()}`,
      speaker: nextSpeaker,
      speakerRole: nextSpeaker,
      timestamp: formatted,
      timeSeconds: nextSeconds,
      text: "",
    };
    const updated = [...dialogue, newTurn];
    if (onUpdateDialogue) {
      onUpdateDialogue(updated);
    }
    setEditingTurn(newTurn);
  };

  return (
    <div className="space-y-3">
      {/* Header Bar */}
      <div className="flex items-center justify-between pb-2 border-b border-zinc-200">
        <div className="flex items-center gap-1.5 text-xs font-mono font-semibold text-zinc-600">
          <MessageSquare className="h-3.5 w-3.5 text-black" />
          <span>Script ({dialogue.length} Turns)</span>
        </div>

        <div className="flex items-center gap-1.5">
          <Button
            variant="outline"
            size="sm"
            onClick={handleAddNewTurn}
            className="h-7 px-2 text-xs gap-1 border-zinc-200 hover:border-black rounded-none"
          >
            <Plus className="h-3 w-3" />
            <span>Add Turn</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleCopy}
            className="h-7 px-2 text-xs gap-1 border-zinc-200 rounded-none"
          >
            {copied ? <Check className="h-3 w-3 text-black" /> : <Copy className="h-3 w-3" />}
            <span>{copied ? "Copied" : "Copy"}</span>
          </Button>
        </div>
      </div>

      {/* Turns List */}
      <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
        {dialogue.map((turn) => (
          <ScriptTurnItem
            key={turn.id}
            turn={turn}
            onSeekTo={onSeekTo}
            onEdit={setEditingTurn}
          />
        ))}
      </div>

      {/* Edit Turn Modal Dialog */}
      <EditTurnModal
        isOpen={editingTurn !== null}
        turn={editingTurn}
        onClose={() => setEditingTurn(null)}
        onSave={handleSaveTurn}
        onDelete={handleDeleteTurn}
      />
    </div>
  );
};
