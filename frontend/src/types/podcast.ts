export type PodcastFormat = "dialogue" | "solo" | "interview";

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

export interface PodcastChapter {
  id: string;
  time: number;
  formattedTime: string;
  title: string;
  summary: string;
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
  formattedDuration: string;
  waveform: number[];
  /** Null until the render finishes; the player shows a pending state. */
  audioUrl: string | null;
  chapters: PodcastChapter[];
  dialogue: PodcastDialogueTurn[];
  showNotes: string;
  keyTakeaways: string[];
}
