import type { ScriptTurn } from "./tts-types.js";

export const PCM_SAMPLE_RATE_HZ = 24_000;
export const PCM_BITS_PER_SAMPLE = 16;
export const PCM_CHANNELS = 1;
export const WAV_HEADER_BYTES = 44;
export const TURNS_PER_CHUNK = 2;

/**
 * Splits a script into pieces that each still contain both speakers.
 * multiSpeakerVoiceConfig rejects a request whose transcript names only one of
 * the speakers it declares, so a trailing single-speaker chunk is folded back
 * into the one before it.
 */
export function chunkBySpeakerPairs(script: ScriptTurn[]): ScriptTurn[][] {
  const chunks: ScriptTurn[][] = [];
  let current: ScriptTurn[] = [];

  // A chunk closes only once it holds both speakers, so a host taking two
  // turns in a row widens that chunk rather than producing a one-voice request.
  for (const turn of script) {
    current.push(turn);
    const bothSpeakers = new Set(current.map((each) => each.speaker)).size >= 2;
    if (current.length >= TURNS_PER_CHUNK && bothSpeakers) {
      chunks.push(current);
      current = [];
    }
  }

  // Whatever is left cannot stand alone: it is short, or single-voiced, or both.
  if (current.length > 0) {
    const previous = chunks[chunks.length - 1];
    if (previous) previous.push(...current);
    else chunks.push(current);
  }
  return chunks;
}

export function pcmToWav(pcm: Buffer): Buffer {
  const byteRate = (PCM_SAMPLE_RATE_HZ * PCM_CHANNELS * PCM_BITS_PER_SAMPLE) / 8;
  const blockAlign = (PCM_CHANNELS * PCM_BITS_PER_SAMPLE) / 8;
  const header = Buffer.alloc(WAV_HEADER_BYTES);
  header.write("RIFF", 0);
  header.writeUInt32LE(36 + pcm.length, 4);
  header.write("WAVE", 8);
  header.write("fmt ", 12);
  header.writeUInt32LE(16, 16);
  header.writeUInt16LE(1, 20);
  header.writeUInt16LE(PCM_CHANNELS, 22);
  header.writeUInt32LE(PCM_SAMPLE_RATE_HZ, 24);
  header.writeUInt32LE(byteRate, 28);
  header.writeUInt16LE(blockAlign, 32);
  header.writeUInt16LE(PCM_BITS_PER_SAMPLE, 34);
  header.write("data", 36);
  header.writeUInt32LE(pcm.length, 40);
  return Buffer.concat([header, pcm]);
}

export function escapeForSsml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}
