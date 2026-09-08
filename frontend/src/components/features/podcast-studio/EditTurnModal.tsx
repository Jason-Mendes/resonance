import * as React from "react";
import { createPortal } from "react-dom";
import { PodcastDialogueTurn } from "@/types/podcast";
import { EditTurnForm } from "./EditTurnForm";

export interface EditTurnModalProps {
  isOpen: boolean;
  turn: PodcastDialogueTurn | null;
  onClose: () => void;
  onSave: (updatedTurn: PodcastDialogueTurn) => void;
  onDelete?: (id: string) => void;
}

export const EditTurnModal: React.FC<EditTurnModalProps> = ({
  isOpen,
  turn,
  onClose,
  onSave,
  onDelete,
}) => {
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !isOpen || !turn) return null;

  return createPortal(
    <div
      className="fixed inset-0 top-0 left-0 w-screen h-screen z-[9999] flex items-center justify-center bg-black/60 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg border border-black bg-white p-6 shadow-2xl rounded-none space-y-5 animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* key resets the draft text whenever a different turn is opened */}
        <EditTurnForm
          key={turn.id}
          turn={turn}
          onClose={onClose}
          onSave={onSave}
          onDelete={onDelete}
        />
      </div>
    </div>,
    document.body
  );
};
