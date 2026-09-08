import { PodcastHost } from "@/types/podcast";

export interface HostPairPreset {
  id: string;
  name: string;
  format: "dialogue" | "solo";
  description: string;
  hosts: PodcastHost[];
}

export const HOST_PAIR_PRESETS: HostPairPreset[] = [
  {
    id: "editorial-desk",
    name: "Dialogue",
    format: "dialogue",
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
    name: "Solo",
    format: "solo",
    description: "Single host presentation.",
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
