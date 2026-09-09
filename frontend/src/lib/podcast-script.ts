import { PodcastDialogueTurn, PodcastHost } from "@/types/podcast";

export interface BackendScriptTurn {
  speaker: string;
  text: string;
}

const TURN_GAP_SECONDS = 20;
const SECONDS_PER_MINUTE = 60;

/** Seconds to "m:ss". Floors, so a fractional playback position formats too. */
export const formatTimestamp = (totalSeconds: number): string => {
  const mins = Math.floor(totalSeconds / SECONDS_PER_MINUTE);
  const secs = Math.floor(totalSeconds % SECONDS_PER_MINUTE);
  return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
};

/** Builds an empty turn that follows on from the last one, alternating speakers. */
export const createNextDialogueTurn = (dialogue: PodcastDialogueTurn[]): PodcastDialogueTurn => {
  const lastTurn = dialogue[dialogue.length - 1];
  const speaker = lastTurn?.speaker === "Host 1" ? "Host 2" : "Host 1";
  const timeSeconds = (lastTurn?.timeSeconds || 0) + TURN_GAP_SECONDS;

  return {
    id: `turn-${Date.now()}`,
    speaker,
    speakerRole: speaker,
    timestamp: formatTimestamp(timeSeconds),
    timeSeconds,
    text: "",
  };
};

export const formatDialogueAsScript = (dialogue: PodcastDialogueTurn[]): string =>
  dialogue.map((turn) => `[${turn.timestamp}] ${turn.speaker}:\n${turn.text}`).join("\n\n");

// Broadcast narration pace. Only an estimate: true offsets exist once audio is
// rendered, and these are replaced by the real ones when it is.
const WORDS_PER_MINUTE = 150;

const estimateTurnSeconds = (text: string): number => {
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round((words / WORDS_PER_MINUTE) * SECONDS_PER_MINUTE));
};

// The backend labels turns HostA and HostB; the UI shows the selected preset's
// host names. This is the only place the two vocabularies meet.
const SPEAKER_SLOTS: Record<string, number> = { HostA: 0, HostB: 1 };

const resolveHost = (speaker: string, hosts: PodcastHost[], turnIndex: number): PodcastHost => {
  // An unrecognised label falls back to alternating, which keeps a two-host
  // read sounding right even if the model invents its own speaker names.
  const slot = SPEAKER_SLOTS[speaker] ?? turnIndex % hosts.length;
  return hosts[slot] ?? hosts[0];
};

/**
 * Stretches estimated turn timings onto the real length of the rendered audio.
 *
 * The estimator assumes a fixed words-per-minute, and the synthesised voices do
 * not hit it exactly. Measured on a rendered episode the estimate ran 9 percent
 * fast, which by the sixth turn put every timestamp 9 seconds early: more than
 * a turn's worth, so the transcript named the wrong speaker. Scaling by the
 * ratio of real to estimated total removes that accumulated error.
 */
export const rescaleTurnTimings = (
  dialogue: PodcastDialogueTurn[],
  estimatedTotal: number,
  actualTotal: number,
): PodcastDialogueTurn[] => {
  if (estimatedTotal <= 0 || actualTotal <= 0) return dialogue;

  const scale = actualTotal / estimatedTotal;
  return dialogue.map((turn) => {
    const timeSeconds = Math.round(turn.timeSeconds * scale);
    return { ...turn, timeSeconds, timestamp: formatTimestamp(timeSeconds) };
  });
};

/**
 * The turn being spoken at a given moment: the last one that has started.
 * Returns null before the first turn, so nothing is highlighted at rest.
 */
export const findActiveTurnId = (
  dialogue: PodcastDialogueTurn[],
  currentSeconds: number,
): string | null => {
  let active: string | null = null;
  for (const turn of dialogue) {
    if (turn.timeSeconds > currentSeconds) break;
    active = turn.id;
  }
  return active;
};

/** Adapts the backend's script into the turns the studio transcript renders. */
export const toDialogueTurns = (
  script: BackendScriptTurn[],
  hosts: PodcastHost[],
): PodcastDialogueTurn[] => {
  let elapsedSeconds = 0;

  return script.map((turn, index) => {
    const host = resolveHost(turn.speaker, hosts, index);
    const startsAt = elapsedSeconds;
    elapsedSeconds += estimateTurnSeconds(turn.text);

    return {
      id: `turn-${index}`,
      speaker: host.name,
      speakerRole: host.role,
      timestamp: formatTimestamp(startsAt),
      timeSeconds: startsAt,
      text: turn.text,
    };
  });
};
