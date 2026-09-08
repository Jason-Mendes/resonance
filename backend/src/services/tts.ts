/**
 * Cloud Text-to-Speech. Authenticates by Application Default Credentials, so
 * there is no API key: the organisation policy on the hackathon project
 * disallows them. Locally that means `gcloud auth application-default login`;
 * on Cloud Run the service account is picked up automatically.
 */
import textToSpeech from '@google-cloud/text-to-speech';

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
  HostA: 'en-US-Studio-Q',
  HostB: 'en-US-Studio-O',
};
const FALLBACK_VOICE = 'en-US-Studio-Q';
const LANGUAGE_CODE = 'en-US';

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
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

async function synthesizeTurn(turn: ScriptTurn): Promise<Buffer> {
  // The pause lives inside this turn's audio, so the gap survives however the
  // segments are later joined.
  const ssml = `<speak>${escapeForSsml(turn.text)}<break time="${PAUSE_AFTER_TURN_MS}ms"/></speak>`;

  const [response] = await client.synthesizeSpeech({
    input: { ssml },
    voice: { languageCode: LANGUAGE_CODE, name: VOICE_BY_SPEAKER[turn.speaker] ?? FALLBACK_VOICE },
    audioConfig: {
      audioEncoding: 'MP3',
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
