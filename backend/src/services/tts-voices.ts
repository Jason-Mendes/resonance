export type VoicePairType = "male_female" | "female_female" | "male_male";

export interface PodcastHostInfo {
  id: string;
  name: string;
  gender: "male" | "female";
  role: string;
  voice: string;
}

const DIALOGUE_VOICES: Record<VoicePairType, Record<string, string>> = {
  male_female: { HostA: "Algieba", HostB: "Aoede" },
  female_female: { HostA: "Aoede", HostB: "Kore" },
  male_male: { HostA: "Algieba", HostB: "Puck" },
};

const HOST_METADATA: Record<VoicePairType, PodcastHostInfo[]> = {
  male_female: [
    { id: "HostA", name: "Host 1 (Marcus)", gender: "male", role: "Lead Anchor", voice: "Algieba" },
    { id: "HostB", name: "Host 2 (Elena)", gender: "female", role: "Analyst", voice: "Aoede" },
  ],
  female_female: [
    { id: "HostA", name: "Host 1 (Elena)", gender: "female", role: "Lead Anchor", voice: "Aoede" },
    { id: "HostB", name: "Host 2 (Klara)", gender: "female", role: "Analyst", voice: "Kore" },
  ],
  male_male: [
    { id: "HostA", name: "Host 1 (Marcus)", gender: "male", role: "Lead Anchor", voice: "Algieba" },
    { id: "HostB", name: "Host 2 (David)", gender: "male", role: "Analyst", voice: "Puck" },
  ],
};

/** The one place that decides whether a caller's pair id is real. */
export function isVoicePair(value: unknown): value is VoicePairType {
  return typeof value === "string" && value in DIALOGUE_VOICES;
}

export const DEFAULT_VOICE_PAIR: VoicePairType = "male_female";
export const DEFAULT_DIALOGUE_VOICE = "Algieba";

export function resolveDialogueVoiceMap(pair?: string): Record<string, string> {
  const normalized = (pair as VoicePairType) ?? DEFAULT_VOICE_PAIR;
  return DIALOGUE_VOICES[normalized] ?? DIALOGUE_VOICES.male_female;
}

export function resolveHostsForVoicePair(pair?: string): PodcastHostInfo[] {
  const normalized = (pair as VoicePairType) ?? DEFAULT_VOICE_PAIR;
  return HOST_METADATA[normalized] ?? HOST_METADATA.male_female;
}
