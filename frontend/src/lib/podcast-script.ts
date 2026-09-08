import { PodcastDialogueTurn } from "@/types/podcast";

const TURN_GAP_SECONDS = 20;
const SECONDS_PER_MINUTE = 60;

const formatTimestamp = (totalSeconds: number): string => {
  const mins = Math.floor(totalSeconds / SECONDS_PER_MINUTE);
  const secs = totalSeconds % SECONDS_PER_MINUTE;
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
