import * as React from "react";

import { PodcastNotesCard } from "./PodcastNotesCard";
import { PodcastShowNotesActions } from "./PodcastShowNotesActions";

import { PodcastEpisode } from "@/types/podcast";

const COPIED_RESET_MS = 2000;
const EXPORT_DELAY_MS = 800;

export interface PodcastShowNotesProps {
  episode: PodcastEpisode;
}

export const PodcastShowNotes: React.FC<PodcastShowNotesProps> = ({ episode }) => {
  const [copiedFeed, setCopiedFeed] = React.useState(false);
  const [isDownloading, setIsDownloading] = React.useState(false);

  const handleCopyFeed = () => {
    navigator.clipboard.writeText(`https://resonance.media/podcasts/episodes/${episode.id}.xml`);
    setCopiedFeed(true);
    setTimeout(() => setCopiedFeed(false), COPIED_RESET_MS);
  };

  const handleDownload = () => {
    setIsDownloading(true);
    setTimeout(() => {
      setIsDownloading(false);
      alert(`Audio file "${episode.title}.mp3" downloaded.`);
    }, EXPORT_DELAY_MS);
  };

  return (
    <div className="space-y-3">
      <PodcastNotesCard episode={episode} />

      <PodcastShowNotesActions
        copiedFeed={copiedFeed}
        isDownloading={isDownloading}
        onCopyFeed={handleCopyFeed}
        onDownload={handleDownload}
      />
    </div>
  );
};
