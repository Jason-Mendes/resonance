/**
 * Cloud Text-to-Speech. Authenticates by Application Default Credentials, so
 * there is no API key: the organisation policy on the hackathon project
 * disallows them. Locally that means `gcloud auth application-default login`;
 * on Cloud Run the service account is picked up automatically.
 */
import textToSpeech from "@google-cloud/text-to-speech";

import { getVertexClient } from "../lib/vertex.js";

const client = new textToSpeech.TextToSpeechClient();

/** One line of dialogue, matching what generatePodcastScript returns. */
export interface ScriptTurn {
  speaker: string;
  text: string;
}

// Studio voices: Google's broadcast tier, chosen over Neural2 because the
// Neural2 output read as obviously synthetic. Studio costs more per character,
// so the turn caps in routes/tts.ts matter more than they did.
// HostA is the analytical host, HostB the curious one, per services/gemini.ts.
const VOICE_BY_SPEAKER: Record<string, string> = {
  HostA: "en-US-Studio-Q",
  HostB: "en-US-Studio-O",
};
const FALLBACK_VOICE = "en-US-Studio-Q";
const LANGUAGE_CODE = "en-US";

// 48kHz rather than the 24kHz default. Slightly larger files, noticeably less
// of the tinny quality that makes synthesis obvious.
const SAMPLE_RATE_HZ = 48_000;

// A hair under natural pace. Podcast hosts do not read at full speed.
const SPEAKING_RATE = 0.96;

// Silence after each turn. Zero gap between speakers is one of the strongest
// tells that audio was machine-assembled.
const PAUSE_AFTER_TURN_MS = 450;

/**
 * The model writes plain prose, which may contain characters that are markup
 * in SSML. Unescaped, an ampersand or angle bracket makes the whole request
 * invalid rather than merely mispronounced.
 */
function escapeForSsml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

async function synthesizeTurn(turn: ScriptTurn, voiceOverride?: string): Promise<Buffer> {
  // The pause lives inside this turn's audio, so the gap survives however the
  // segments are later joined.
  const ssml = `<speak>${escapeForSsml(turn.text)}<break time="${PAUSE_AFTER_TURN_MS}ms"/></speak>`;

  const [response] = await client.synthesizeSpeech({
    input: { ssml },
    voice: {
      languageCode: LANGUAGE_CODE,
      name: voiceOverride ?? VOICE_BY_SPEAKER[turn.speaker] ?? FALLBACK_VOICE,
    },
    audioConfig: {
      audioEncoding: "MP3",
      sampleRateHertz: SAMPLE_RATE_HZ,
      speakingRate: SPEAKING_RATE,
    },
  });

  const audio = response.audioContent;
  if (!audio) {
    throw new Error(`Cloud TTS returned no audio for speaker ${turn.speaker}`);
  }
  return Buffer.from(audio);
}

/**
 * Renders a whole script to a single MP3.
 *
 * Turns are synthesised sequentially rather than in parallel. Order is the
 * point of a dialogue, and firing dozens of concurrent requests is the fastest
 * way to hit the per-minute quota mid-episode.
 */
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

// Pro, not the flash variant. Flash renders the same script in roughly half
// the time, but on a side-by-side listen its male voice is raspier and more
// obviously synthetic. Parallel chunking already holds render time near a
// minute at any script length, so the speed Flash buys is not worth the voice.
const DIALOGUE_MODEL = "gemini-2.5-pro-preview-tts";

// Gemini returns headerless 16-bit mono PCM at this rate.
const PCM_SAMPLE_RATE_HZ = 24_000;
const PCM_BITS_PER_SAMPLE = 16;
const PCM_CHANNELS = 1;
const WAV_HEADER_BYTES = 44;

// Used if the model invents a speaker the mapping does not cover.
const DEFAULT_DIALOGUE_VOICE = "Algieba";

// Turns per parallel request. Wall time is set by the slowest chunk, so
// smaller is faster, and more chunks also make the reported progress finer.
// Two is the floor: multiSpeakerVoiceConfig needs both speakers in a chunk,
// and two alternating turns is exactly that. Measured on a 7-turn script,
// two per chunk rendered in 56 seconds against 62 for three.
const TURNS_PER_CHUNK = 2;

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

/** Wraps raw PCM in a WAV container so browsers and players can read it. */
function pcmToWav(pcm: Buffer): Buffer {
  const byteRate = (PCM_SAMPLE_RATE_HZ * PCM_CHANNELS * PCM_BITS_PER_SAMPLE) / 8;
  const blockAlign = (PCM_CHANNELS * PCM_BITS_PER_SAMPLE) / 8;
  const header = Buffer.alloc(WAV_HEADER_BYTES);
  header.write("RIFF", 0);
  header.writeUInt32LE(36 + pcm.length, 4);
  header.write("WAVE", 8);
  header.write("fmt ", 12);
  header.writeUInt32LE(16, 16); // fmt chunk size
  header.writeUInt16LE(1, 20); // 1 = uncompressed PCM
  header.writeUInt16LE(PCM_CHANNELS, 22);
  header.writeUInt32LE(PCM_SAMPLE_RATE_HZ, 24);
  header.writeUInt32LE(byteRate, 28);
  header.writeUInt16LE(blockAlign, 32);
  header.writeUInt16LE(PCM_BITS_PER_SAMPLE, 34);
  header.write("data", 36);
  header.writeUInt32LE(pcm.length, 40);
  return Buffer.concat([header, pcm]);
}

/** Audio plus the content type it should be served with. */
export interface RenderedAudio {
  audio: Buffer;
  mimeType: string;
}

/**
 * A briefing carries the words it narrates. The model writes the summary
 * during the render, so this is the only place that text exists; asking for it
 * separately would mean a second call that produced different words.
 */
export interface NarratedAudio extends RenderedAudio {
  text: string;
}

/** Synthesises one chunk, returning raw PCM so chunks can be joined. */
async function synthesizeChunk(
  turns: ScriptTurn[],
  voiceBySpeaker: Record<string, string>,
): Promise<Buffer> {
  const transcript = turns.map((turn) => `${turn.speaker}: ${turn.text}`).join("\n");

  const speakerVoiceConfigs = [...new Set(turns.map((turn) => turn.speaker))].map((speaker) => ({
    speaker,
    voiceConfig: {
      prebuiltVoiceConfig: {
        voiceName: voiceBySpeaker[speaker] ?? DEFAULT_DIALOGUE_VOICE,
      },
    },
  }));

  const response = await getVertexClient().models.generateContent({
    model: DIALOGUE_MODEL,
    contents: [
      {
        role: "user",
        parts: [
          {
            text: `Read this as a natural two-host news podcast. Conversational and engaged, at the pace of real radio.\n\n${transcript}`,
          },
        ],
      },
    ],
    config: {
      responseModalities: ["AUDIO"],
      speechConfig: { multiSpeakerVoiceConfig: { speakerVoiceConfigs } },
    },
  });

  const inline = response.candidates?.[0]?.content?.parts?.[0]?.inlineData;
  if (!inline?.data) {
    throw new Error("Gemini returned no audio for a dialogue chunk");
  }
  return Buffer.from(inline.data, "base64");
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
  voiceBySpeaker: Record<string, string>,
  reportProgress?: (fraction: number) => void,
): Promise<RenderedAudio> {
  const parts = chunkBySpeakerPairs(script);

  // Chunks finish out of order, so progress counts completions rather than
  // tracking any one chunk's position.
  let done = 0;
  const chunks = await Promise.all(
    parts.map(async (part) => {
      const audio = await synthesizeChunk(part, voiceBySpeaker);
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
export async function synthesizeBriefing(text: string, voiceName: string): Promise<NarratedAudio> {
  const audio = await synthesizeTurn({ speaker: "__briefing", text }, voiceName);
  return { audio, mimeType: "audio/mpeg", text };
}
