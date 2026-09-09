import { Copy, Check, MessageSquare, Plus, RefreshCw } from "lucide-react";
import * as React from "react";

import { Button } from "@/components/ui/Button";
import { formatDialogueAsScript } from "@/lib/podcast-script";
import { PodcastDialogueTurn } from "@/types/podcast";

const COPIED_RESET_MS = 2000;

interface ResynthesizeButtonProps {
  onResynthesize: (dialogue?: PodcastDialogueTurn[]) => void;
  isResynthesizing: boolean;
  dialogue: PodcastDialogueTurn[];
}

const ResynthesizeButton: React.FC<ResynthesizeButtonProps> = ({
  onResynthesize,
  isResynthesizing,
  dialogue,
}) => (
  <Button
    variant="outline"
    size="sm"
    disabled={isResynthesizing}
    onClick={() => onResynthesize(dialogue)}
    className="h-7 px-2 text-xs gap-1 bg-black text-white hover:bg-zinc-800 border-black rounded-none"
  >
    <RefreshCw className={`h-3 w-3 ${isResynthesizing ? "animate-spin" : ""}`} />
    <span>{isResynthesizing ? "Re-synthesizing..." : "Re-synthesize Audio"}</span>
  </Button>
);

const CopyScriptButton: React.FC<{ dialogue: PodcastDialogueTurn[] }> = ({ dialogue }) => {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(formatDialogueAsScript(dialogue));
    setCopied(true);
    setTimeout(() => setCopied(false), COPIED_RESET_MS);
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleCopy}
      className="h-7 px-2 text-xs gap-1 border-zinc-200 rounded-none"
    >
      {copied ? <Check className="h-3 w-3 text-black" /> : <Copy className="h-3 w-3" />}
      <span>{copied ? "Copied" : "Copy"}</span>
    </Button>
  );
};

export interface PodcastTranscriptToolbarProps {
  dialogue: PodcastDialogueTurn[];
  onAddTurn: () => void;
  onResynthesize?: (dialogue?: PodcastDialogueTurn[]) => void;
  isResynthesizing?: boolean;
}

export const PodcastTranscriptToolbar: React.FC<PodcastTranscriptToolbarProps> = ({
  dialogue,
  onAddTurn,
  onResynthesize,
  isResynthesizing = false,
}) => (
  <div className="flex items-center justify-between pb-2 border-b border-zinc-200">
    <div className="flex items-center gap-1.5 text-xs font-mono font-semibold text-zinc-600">
      <MessageSquare className="h-3.5 w-3.5 text-black" />
      <span>Script ({dialogue.length} Turns)</span>
    </div>

    <div className="flex items-center gap-1.5">
      {onResynthesize && (
        <ResynthesizeButton
          onResynthesize={onResynthesize}
          isResynthesizing={isResynthesizing}
          dialogue={dialogue}
        />
      )}

      <Button
        variant="outline"
        size="sm"
        onClick={onAddTurn}
        className="h-7 px-2 text-xs gap-1 border-zinc-200 hover:border-black rounded-none"
      >
        <Plus className="h-3 w-3" />
        <span>Add Turn</span>
      </Button>

      <CopyScriptButton dialogue={dialogue} />
    </div>
  </div>
);
