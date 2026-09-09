import * as React from "react";

import { PodcastNotesCard } from "./PodcastNotesCard";
import { PodcastShowNotesActions } from "./PodcastShowNotesActions";

import { PodcastEpisode } from "@/types/podcast";

export interface PodcastShowNotesProps {
  episode: PodcastEpisode;
}

/** Turns a title into something safe to write to a filesystem. */
const toFileName = (title: string, format: string): string =>
  `${title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")}.${format}`;

export const PodcastShowNotes: React.FC<PodcastShowNotesProps> = ({ episode }) => (
  <div className="space-y-3">
    <PodcastNotesCard episode={episode} />

    <PodcastShowNotesActions
      audioUrl={episode.audioUrl}
      fileName={toFileName(episode.title, episode.format === "summary" ? "mp3" : "wav")}
    />
  </div>
);
