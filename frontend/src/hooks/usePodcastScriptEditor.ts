import { useCallback, useState } from "react";
import { PodcastDialogueTurn } from "@/types/podcast";
import { createNextDialogueTurn } from "@/lib/podcast-script";

export const usePodcastScriptEditor = (
  dialogue: PodcastDialogueTurn[],
  onUpdateDialogue?: (dialogue: PodcastDialogueTurn[]) => void
) => {
  const [editingTurn, setEditingTurn] = useState<PodcastDialogueTurn | null>(
    null
  );

  const saveTurn = useCallback(
    (updatedTurn: PodcastDialogueTurn) => {
      const updated = dialogue.map((turn) =>
        turn.id === updatedTurn.id ? updatedTurn : turn
      );
      onUpdateDialogue?.(updated);
    },
    [dialogue, onUpdateDialogue]
  );

  const deleteTurn = useCallback(
    (id: string) => {
      onUpdateDialogue?.(dialogue.filter((turn) => turn.id !== id));
    },
    [dialogue, onUpdateDialogue]
  );

  const addTurn = useCallback(() => {
    const newTurn = createNextDialogueTurn(dialogue);
    onUpdateDialogue?.([...dialogue, newTurn]);
    setEditingTurn(newTurn);
  }, [dialogue, onUpdateDialogue]);

  return { editingTurn, setEditingTurn, saveTurn, deleteTurn, addTurn };
};
