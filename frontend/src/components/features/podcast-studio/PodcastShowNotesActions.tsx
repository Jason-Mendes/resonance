import { Download, Rss, Check } from "lucide-react";
import * as React from "react";

import { Button } from "@/components/ui/Button";

export interface PodcastShowNotesActionsProps {
  copiedFeed: boolean;
  isDownloading: boolean;
  onCopyFeed: () => void;
  onDownload: () => void;
}

export const PodcastShowNotesActions: React.FC<PodcastShowNotesActionsProps> = ({
  copiedFeed,
  isDownloading,
  onCopyFeed,
  onDownload,
}) => (
  <div className="grid grid-cols-2 gap-2">
    <Button
      variant="outline"
      size="sm"
      onClick={onCopyFeed}
      className="h-8 gap-1.5 text-xs border-zinc-200 hover:border-black rounded-none"
    >
      {copiedFeed ? (
        <Check className="h-3 w-3 text-black" />
      ) : (
        <Rss className="h-3 w-3 text-black" />
      )}
      <span>{copiedFeed ? "Copied" : "RSS Feed"}</span>
    </Button>

    <Button
      size="sm"
      onClick={onDownload}
      disabled={isDownloading}
      className="h-8 gap-1.5 text-xs bg-black hover:bg-zinc-800 text-white rounded-none"
    >
      <Download className="h-3 w-3" />
      <span>{isDownloading ? "Exporting..." : "Download MP3"}</span>
    </Button>
  </div>
);
