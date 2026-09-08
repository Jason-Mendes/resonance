import * as React from "react";
import { createPortal } from "react-dom";
import { X, Trash2, Check } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Textarea";
import { PodcastDialogueTurn } from "@/types/podcast";

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
  const [text, setText] = React.useState<string>("");

  React.useEffect(() => {
    setMounted(true);
  }, []);

  React.useEffect(() => {
    if (turn) {
      setText(turn.text);
    }
  }, [turn]);

  if (!mounted || !isOpen || !turn) return null;

  const handleSave = () => {
    onSave({
      ...turn,
      text,
    });
    onClose();
  };

  const handleDelete = () => {
    if (onDelete) {
      onDelete(turn.id);
      onClose();
    }
  };

  return createPortal(
    <div
      className="fixed inset-0 top-0 left-0 w-screen h-screen z-[9999] flex items-center justify-center bg-black/60 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg border border-black bg-white p-6 shadow-2xl rounded-none space-y-5 animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-zinc-200">
          <div>
            <h3 className="font-serif text-lg font-bold text-black">
              Edit Dialogue Turn
            </h3>
            <div className="flex items-center gap-2 mt-1">
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-zinc-100 border border-zinc-200 text-xs font-semibold text-black rounded-none">
                <span className="h-4 w-4 bg-black text-white text-[9px] font-mono flex items-center justify-center font-bold">
                  {turn.speaker === "Host 1" ? "1" : "2"}
                </span>
                <span>{turn.speaker}</span>
              </span>
              <span className="text-[11px] font-mono text-zinc-400">
                [{turn.timestamp}]
              </span>
            </div>
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8 text-zinc-500 hover:text-black rounded-none"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Text Area */}
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

        {/* Actions */}
        <div className="flex items-center justify-between pt-2 border-t border-zinc-100">
          {onDelete ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDelete}
              className="text-xs text-red-600 hover:bg-red-50 hover:text-red-700 gap-1 rounded-none px-2"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>Delete Turn</span>
            </Button>
          ) : (
            <div />
          )}

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onClose}
              className="text-xs border-zinc-200 rounded-none px-3"
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleSave}
              className="text-xs bg-black text-white hover:bg-zinc-800 gap-1 rounded-none px-4"
            >
              <Check className="h-3.5 w-3.5" />
              <span>Save Changes</span>
            </Button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};
