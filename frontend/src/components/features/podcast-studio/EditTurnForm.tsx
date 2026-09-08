import * as React from "react";
import { Textarea } from "@/components/ui/Textarea";
import { PodcastDialogueTurn } from "@/types/podcast";
import { EditTurnHeader } from "./EditTurnHeader";
import { EditTurnActions } from "./EditTurnActions";

export interface EditTurnFormProps {
  turn: PodcastDialogueTurn;
  onClose: () => void;
  onSave: (updatedTurn: PodcastDialogueTurn) => void;
  onDelete?: (id: string) => void;
}

export const EditTurnForm: React.FC<EditTurnFormProps> = ({
  turn,
  onClose,
  onSave,
  onDelete,
}) => {
  const [text, setText] = React.useState<string>(turn.text);

  const handleSave = () => {
    onSave({ ...turn, text });
    onClose();
  };

  const handleDelete = () => {
    if (!onDelete) return;
    onDelete(turn.id);
    onClose();
  };

  return (
    <>
      <EditTurnHeader turn={turn} onClose={onClose} />

      <div className="space-y-1.5">
        <label className="text-[11px] font-mono uppercase tracking-wider text-zinc-500 font-semibold block">
          Spoken Text
        </label>
        <Textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="min-h-[160px] text-sm leading-relaxed border-zinc-200 p-3 rounded-none font-sans"
          placeholder="Type spoken dialogue..."
          autoFocus
        />
      </div>

      <EditTurnActions
        onCancel={onClose}
        onSave={handleSave}
        onDelete={onDelete ? handleDelete : undefined}
      />
    </>
  );
};
