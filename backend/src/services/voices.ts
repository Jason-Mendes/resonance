/**
 * One catalogue for both speech paths.
 *
 * Gemini multi-speaker TTS and Cloud TTS Chirp3-HD share a voice roster: the
 * Gemini voice "Algieba" is the same voice as "en-US-Chirp3-HD-Algieba". So
 * each voice is listed once and carries the name each API knows it by.
 *
 * Studio has only two en-US voices, Q and O, and they are not in the Gemini
 * roster at all. That is why a briefing voice carries no Gemini name and the
 * types stop one being used as a podcast host.
 */

export type Gender = "male" | "female";

/** Usable as a podcast host: needs a name Gemini multi-speaker TTS accepts. */
export interface DialogueVoice {
  id: string;
  label: string;
  gender: Gender;
  gemini: string;
  cloudTts: string;
}

/** Usable for the single-voice briefing: only ever spoken by Cloud TTS. */
export interface BriefingVoice {
  id: string;
  label: string;
  gender: Gender;
  cloudTts: string;
}

/**
 * Algieba and Aoede are the only voices anyone has actually heard: they were
 * the constant in the Pro versus Flash model comparison the user judged, so
 * the approval was of the model, with these two voices in it.
 *
 * Charon and Despina are PROVISIONAL. They exist so each same-gender pairing
 * has a second voice, and nobody has listened to them yet.
 */
export const DIALOGUE_VOICES: DialogueVoice[] = [
  {
    id: "algieba",
    label: "Algieba",
    gender: "male",
    gemini: "Algieba",
    cloudTts: "en-US-Chirp3-HD-Algieba",
  },
  {
    id: "aoede",
    label: "Aoede",
    gender: "female",
    gemini: "Aoede",
    cloudTts: "en-US-Chirp3-HD-Aoede",
  },
  {
    id: "charon",
    label: "Charon",
    gender: "male",
    gemini: "Charon",
    cloudTts: "en-US-Chirp3-HD-Charon",
  },
  {
    id: "despina",
    label: "Despina",
    gender: "female",
    gemini: "Despina",
    cloudTts: "en-US-Chirp3-HD-Despina",
  },
];

export type HostPairing = "male-female" | "male-male" | "female-female";

/**
 * Every pairing keeps one voice the user has heard, so no option is wholly
 * unvetted. The two hosts must be DIFFERENT voices even when they share a
 * gender: multiSpeakerVoiceConfig declares one voice per speaker, and giving
 * both the same one makes the hosts indistinguishable in the rendered audio.
 */
const PAIRINGS: Record<HostPairing, { HostA: string; HostB: string }> = {
  "male-female": { HostA: "algieba", HostB: "aoede" },
  "male-male": { HostA: "algieba", HostB: "charon" },
  "female-female": { HostA: "aoede", HostB: "despina" },
};

/** What the podcast sounded like before this feature existed. */
export const DEFAULT_PAIRING: HostPairing = "male-female";

export const HOST_PAIRINGS = Object.keys(PAIRINGS) as HostPairing[];

export function isHostPairing(value: unknown): value is HostPairing {
  return typeof value === "string" && value in PAIRINGS;
}

function dialogueVoice(id: string): DialogueVoice {
  const voice = DIALOGUE_VOICES.find((candidate) => candidate.id === id);
  if (!voice) {
    throw new Error(`Unknown dialogue voice id: ${id}`);
  }
  return voice;
}

/** The two Gemini voice names for a pairing, ready for multiSpeakerVoiceConfig. */
export function resolvePairing(pairing: HostPairing): { HostA: string; HostB: string } {
  const pair = PAIRINGS[pairing];
  return { HostA: dialogueVoice(pair.HostA).gemini, HostB: dialogueVoice(pair.HostB).gemini };
}

/**
 * Four briefing voices, two male and two female.
 *
 * Studio O and Q stay because they are what the briefing already sounds like.
 * They are also the only two en-US Studio voices Google offers, which is why
 * the other two come from Chirp3-HD, and why they are the same voices as the
 * podcast hosts rather than two more strangers: one product, one cast.
 */
export const BRIEFING_VOICES: BriefingVoice[] = [
  { id: "studio-o", label: "Studio O", gender: "female", cloudTts: "en-US-Studio-O" },
  { id: "studio-q", label: "Studio Q", gender: "male", cloudTts: "en-US-Studio-Q" },
  { id: "aoede", label: "Aoede", gender: "female", cloudTts: "en-US-Chirp3-HD-Aoede" },
  { id: "algieba", label: "Algieba", gender: "male", cloudTts: "en-US-Chirp3-HD-Algieba" },
];

/** What the briefing already sounds like. */
export const DEFAULT_BRIEFING_VOICE_ID = "studio-o";

/** Cloud TTS name for a briefing voice id, or undefined when the id is unknown. */
export function resolveBriefingVoice(id: string): string | undefined {
  return BRIEFING_VOICES.find((voice) => voice.id === id)?.cloudTts;
}

const PAIRING_LABELS: Record<HostPairing, string> = {
  "male-female": "One male, one female",
  "male-male": "Two male hosts",
  "female-female": "Two female hosts",
};

/** A pairing as the frontend needs it: an id to send back, and words to show. */
export function describePairing(pairing: HostPairing) {
  const pair = PAIRINGS[pairing];
  const describe = (id: string) => {
    const voice = dialogueVoice(id);
    return { label: voice.label, gender: voice.gender };
  };
  return {
    id: pairing,
    label: PAIRING_LABELS[pairing],
    hosts: { HostA: describe(pair.HostA), HostB: describe(pair.HostB) },
  };
}
