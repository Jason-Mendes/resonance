import * as React from "react";
import { Copy, Check, MessageSquare, Plus } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { PodcastDialogueTurn } from "@/types/podcast";
import { formatDialogueAsScript } from "@/lib/podcast-script";

const COPIED_RESET_MS = 2000;

export interface PodcastTranscriptToolbarProps {
  dialogue: PodcastDialogueTurn[];
  onAddTurn: () => void;
}

export const PodcastTranscriptToolbar: React.FC<
  PodcastTranscriptToolbarProps
> = ({ dialogue, onAddTurn }) => {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(formatDialogueAsScript(dialogue));
    setCopied(true);
    setTimeout(() => setCopied(false), COPIED_RESET_MS);
  };

  return (
    <div className="flex items-center justify-between pb-2 border-b border-zinc-200">
      <div className="flex items-center gap-1.5 text-xs font-mono font-semibold text-zinc-600">
        <MessageSquare className="h-3.5 w-3.5 text-black" />
        <span>Script ({dialogue.length} Turns)</span>
      </div>

      <div className="flex items-center gap-1.5">
        <Button
          variant="outline"
          size="sm"
          onClick={onAddTurn}
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
          {copied ? (
            <Check className="h-3 w-3 text-black" />
          ) : (
            <Copy className="h-3 w-3" />
          )}
          <span>{copied ? "Copied" : "Copy"}</span>
        </Button>
      </div>
    </div>
  );
};
