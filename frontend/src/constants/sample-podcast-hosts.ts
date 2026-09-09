import { PodcastFormat, PodcastHost } from "@/types/podcast";

export interface HostPairPreset {
  id: string;
  name: string;
  format: PodcastFormat;
  description: string;
  hosts: PodcastHost[];
}

export const HOST_PAIR_PRESETS: HostPairPreset[] = [
  {
    id: "editorial-desk",
    name: "Podcast",
    format: "podcast",
    description: "Two hosts in conversation.",
    hosts: [
      {
        id: "host-1",
        name: "Host 1",
        role: "Host 1",
        accent: "Neutral",
        voiceTag: "Voice 1",
      },
      {
        id: "host-2",
        name: "Host 2",
        role: "Host 2",
        accent: "Neutral",
        voiceTag: "Voice 2",
      },
    ],
  },
  {
    id: "solo-dispatch",
    name: "Summary",
    format: "summary",
    description: "One voice, about a minute.",
    hosts: [
      {
        id: "host-1",
        name: "Host 1",
        role: "Host 1",
        accent: "Neutral",
        voiceTag: "Voice 1",
      },
    ],
  },
];
