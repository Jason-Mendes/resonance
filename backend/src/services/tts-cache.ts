import crypto from "node:crypto";

import type { ScriptTurn } from "./tts-types.js";
import type { VoicePairType } from "./tts-voices.js";

const MAX_CACHE_ENTRIES = 500;
const chunkAudioCache = new Map<string, Buffer>();

/**
 * Everything that changes the audio goes into the key. The delivery
 * instruction is part of that: the same words rendered under a different
 * editorial tone are different audio, and keying without it would serve the
 * previous tone back after an editor changed it.
 */
export function createChunkCacheKey(
  turns: ScriptTurn[],
  delivery: string,
  voicePair?: VoicePairType,
): string {
  const payload = turns.map((t) => `${t.speaker}:${t.text}`).join("|");
  const full = `${voicePair ?? "default"}:${delivery}:${payload}`;
  return crypto.createHash("sha256").update(full).digest("hex");
}

export function getChunkCache(key: string): Buffer | undefined {
  const cached = chunkAudioCache.get(key);
  if (!cached) return undefined;
  chunkAudioCache.delete(key);
  chunkAudioCache.set(key, cached);
  return cached;
}

export function setChunkCache(key: string, audio: Buffer): void {
  if (chunkAudioCache.size >= MAX_CACHE_ENTRIES) {
    const oldest = chunkAudioCache.keys().next().value;
    if (oldest !== undefined) {
      chunkAudioCache.delete(oldest);
    }
  }
  chunkAudioCache.set(key, audio);
}

export function clearChunkCache(): void {
  chunkAudioCache.clear();
}
