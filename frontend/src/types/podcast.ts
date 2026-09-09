/**
 * The two things the studio produces. These are different pipelines, not a
 * styling choice: a podcast is a generated two-host script rendered by Gemini,
 * a summary is a sixty-second brief read by one Cloud TTS voice.
 */
export type PodcastFormat = "podcast" | "summary";

export type PodcastGenState = "idle" | "generating" | "completed" | "error";

export interface PodcastHost {
  id: string;
  name: string;
  role: string;
  accent: string;
  avatarUrl?: string;
  voiceTag: string;
}

export interface PodcastDialogueTurn {
  id: string;
  speaker: string;
  speakerRole: string;
  avatarUrl?: string;
  timestamp: string;
  timeSeconds: number;
  text: string;
}

export interface PodcastEpisode {
  id: string;
  articleId: string;
  title: string;
  subtitle: string;
  showName: string;
  hosts: PodcastHost[];
  format: PodcastFormat;
  durationSeconds: number;
  waveform: number[];
  /** Null until the render finishes; the player shows a pending state. */
  audioUrl: string | null;
  dialogue: PodcastDialogueTurn[];
  showNotes: string;
  keyTakeaways: string[];
}
