import textToSpeech from "@google-cloud/text-to-speech";

import { TransientError } from "../lib/errors.js";
import { getVertexClient } from "../lib/vertex.js";

import { createChunkCacheKey, getChunkCache, setChunkCache } from "./tts-cache.js";
import { chunkBySpeakerPairs, escapeForSsml, pcmToWav } from "./tts-pcm.js";
import {
  DEFAULT_DIALOGUE_VOICE,
  resolveDialogueVoiceMap,
  type VoicePairType,
} from "./tts-voices.js";

import type { NarratedAudio, RenderedAudio, ScriptTurn } from "./tts-types.js";

export type { ScriptTurn, RenderedAudio, NarratedAudio };

const client = new textToSpeech.TextToSpeechClient();
// Pro, not the flash variant. Flash renders the same script in roughly half
// the time, but on a side-by-side listen its male voice is raspier and more
// obviously synthetic. Parallel chunking already holds render time near a
// minute at any script length, so the speed Flash buys is not worth the voice.
const DIALOGUE_MODEL = "gemini-2.5-pro-preview-tts";
const BRIEFING_VOICE = "en-US-Studio-O";
const LANGUAGE_CODE = "en-US";
const SAMPLE_RATE_HZ = 48_000;
const SPEAKING_RATE = 0.96;
const PAUSE_AFTER_TURN_MS = 450;

async function synthesizeTurn(turn: ScriptTurn, voiceOverride?: string): Promise<Buffer> {
  const ssml = `<speak>${escapeForSsml(turn.text)}<break time="${PAUSE_AFTER_TURN_MS}ms"/></speak>`;
  const [response] = await client.synthesizeSpeech({
    input: { ssml },
    voice: { languageCode: LANGUAGE_CODE, name: voiceOverride ?? BRIEFING_VOICE },
    audioConfig: {
      audioEncoding: "MP3",
      sampleRateHertz: SAMPLE_RATE_HZ,
      speakingRate: SPEAKING_RATE,
    },
  });
  if (!response.audioContent) {
    throw new Error(`Cloud TTS returned no audio for speaker ${turn.speaker}`);
  }
  return Buffer.from(response.audioContent);
}

export async function synthesizeScript(script: ScriptTurn[]): Promise<Buffer> {
  const parts: Buffer[] = [];
  for (const turn of script) {
    parts.push(await synthesizeTurn(turn));
  }
  return Buffer.concat(parts);
}

// --- Gemini multi-speaker -------------------------------------------------
//
// Everything above renders one turn at a time, so no speaker has heard the
// other and the clips are joined afterwards. Gemini generates the whole
// dialogue in a single call with both parts in view, which is where the
// conversational timing comes from. This is the path the podcast uses; the
// Cloud TTS path above stays for single-voice work like the audio briefing.

// Chunks render in parallel, so one refusal from an overloaded model would
// otherwise throw away every other chunk's finished audio and fail the whole
// episode. Retrying the one chunk costs seconds; re-rendering costs a minute.
const CHUNK_ATTEMPTS = 3;

// Backoff doubles from here. Retrying a rate limit instantly just spends the
// next attempt earning the same refusal.
const RETRY_BASE_MS = 800;

const wait = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms));

/** Synthesises one chunk, returning raw PCM so chunks can be joined. */
async function synthesizeChunk(
  turns: ScriptTurn[],
  delivery: string,
  voicePair?: VoicePairType,
): Promise<Buffer> {
  const transcript = turns.map((turn) => `${turn.speaker}: ${turn.text}`).join("\n");
  const voiceMap = resolveDialogueVoiceMap(voicePair);
  const uniqueSpeakers = [...new Set(turns.map((turn) => turn.speaker))];

  const speakerVoiceConfigs = uniqueSpeakers.map((speaker) => ({
    speaker,
    voiceConfig: {
      prebuiltVoiceConfig: {
        voiceName: voiceMap[speaker] ?? DEFAULT_DIALOGUE_VOICE,
      },
    },
  }));

  const firstSpeaker = uniqueSpeakers[0] ?? "HostA";
  const speechConfig =
    uniqueSpeakers.length > 1
      ? { multiSpeakerVoiceConfig: { speakerVoiceConfigs } }
      : {
          voiceConfig: {
            prebuiltVoiceConfig: {
              voiceName: voiceMap[firstSpeaker] ?? DEFAULT_DIALOGUE_VOICE,
            },
          },
        };

  const response = await getVertexClient().models.generateContent({
    model: DIALOGUE_MODEL,
    contents: [
      {
        role: "user",
        parts: [
          {
            text: `${delivery}\n\n${transcript}`,
          },
        ],
      },
    ],
    config: {
      responseModalities: ["AUDIO"],
      speechConfig,
    },
  });

  const inline = response.candidates?.[0]?.content?.parts?.[0]?.inlineData;
  if (!inline?.data) {
    throw new Error("Gemini returned no audio for a dialogue chunk");
  }
  return Buffer.from(inline.data, "base64");
}

/**
 * One chunk, retried on failure.
 *
 * The dialogue model is a preview endpoint being called several times at once,
 * and it answers some of those with a rate limit or a 503. Those are blips: a
 * measured render that failed outright succeeded on the identical script
 * seconds later. Retrying here means the episode survives one of them.
 */
async function synthesizeChunkWithRetry(
  turns: ScriptTurn[],
  delivery: string,
  voicePair?: VoicePairType,
): Promise<Buffer> {
  let lastError: unknown;

  for (let attempt = 0; attempt < CHUNK_ATTEMPTS; attempt += 1) {
    try {
      return await synthesizeChunk(turns, delivery, voicePair);
    } catch (error) {
      lastError = error;
      if (attempt < CHUNK_ATTEMPTS - 1) await wait(RETRY_BASE_MS * 2 ** attempt);
    }
  }

  // Every attempt failed, so this is worth telling the caller to retry: the
  // detail stays in the log, and the sentence is written for a person.
  console.error("Dialogue chunk failed after every attempt:", lastError);
  throw new TransientError("The audio service kept refusing. Please try again.");
}

/**
 * Renders a dialogue as several chunks in parallel and joins them.
 *
 * Wall time is set by the slowest chunk rather than the whole script, which on
 * a measured 7-turn script took one Pro call from 107 seconds to 76. The
 * chunks share a sample rate and format, so joining is a concatenation of
 * sample data with a single WAV header on the front.
 *
 * Returns WAV, not MP3: the model emits raw PCM and transcoding would mean
 * shipping ffmpeg in the container for no clear gain.
 */
export async function synthesizeDialogue(
  script: ScriptTurn[],
  delivery: string,
  voicePair?: VoicePairType,
  reportProgress?: (fraction: number) => void,
): Promise<RenderedAudio> {
  const parts = chunkBySpeakerPairs(script);
  let done = 0;
  const chunks = await Promise.all(
    parts.map(async (part) => {
      const key = createChunkCacheKey(part, delivery, voicePair);
      const cached = getChunkCache(key);
      if (cached) {
        done += 1;
        reportProgress?.(done / parts.length);
        return cached;
      }
      const audio = await synthesizeChunkWithRetry(part, delivery, voicePair);
      setChunkCache(key, audio);
      done += 1;
      reportProgress?.(done / parts.length);
      return audio;
    }),
  );

  return { audio: pcmToWav(Buffer.concat(chunks)), mimeType: "audio/wav" };
}

/**
 * Renders a single-voice briefing. One speaker, so there is no dialogue for a
 * multi-speaker model to coordinate, and Cloud TTS Studio is the better fit:
 * it is generally available rather than preview, and cheaper per run.
 */
export async function synthesizeBriefing(text: string): Promise<NarratedAudio> {
  const audio = await synthesizeTurn({ speaker: "__briefing", text }, BRIEFING_VOICE);
  return { audio, mimeType: "audio/mpeg", text };
}
