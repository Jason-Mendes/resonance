/**
 * Turning an article into a finished episode. Kept out of the hook so that one
 * owns React state while this owns the pipeline, and each stays readable.
 */
import { HOST_PAIR_PRESETS } from "@/constants/sample-podcast-hosts";
import {
  fetchReadingLayers,
  fetchScript,
  renderAudio,
  renderSummary,
  SCRIPT_DONE_PROGRESS,
  type ProducedAudio,
} from "@/lib/podcast-api";
import { BackendScriptTurn, toDialogueTurns } from "@/lib/podcast-script";
import { extractWaveform } from "@/lib/waveform";
import { Article } from "@/types/article";
import { PodcastEpisode, PodcastFormat } from "@/types/podcast";

const TITLE_MAX_CHARS = 48;
const TRAILING_TURN_SECONDS = 20;

/**
 * The bar between the script landing and the audio finishing. Render progress
 * is a real fraction of chunks completed, mapped onto what is left of the bar.
 */
export const renderProgressToBar = (fraction: number): number =>
  Math.round(SCRIPT_DONE_PROGRESS + fraction * (100 - SCRIPT_DONE_PROGRESS));

/** Everything a production needs. One object, since five positional arguments
 *  stopped reading as anything at the call site. */
export interface ProductionRequest {
  article: Article;
  pairId: string;
  format: PodcastFormat;
  /** Called as soon as there is a transcript worth showing. */
  onReady: (episode: PodcastEpisode) => void;
  /** Chunks completed, 0 to 1. A summary has no chunks to report. */
  onRenderProgress: (fraction: number) => void;
}

const buildEpisode = (
  article: Article,
  script: BackendScriptTurn[],
  pairId: string,
  format: PodcastFormat,
): PodcastEpisode => {
  const preset = HOST_PAIR_PRESETS.find((p) => p.id === pairId) ?? HOST_PAIR_PRESETS[0];
  const dialogue = toDialogueTurns(script, preset.hosts);
  const lastTurn = dialogue[dialogue.length - 1];
  // Derived from the script's own estimated timings rather than a fixed number,
  // so the duration shown moves with the content.
  const durationSeconds = lastTurn ? lastTurn.timeSeconds + TRAILING_TURN_SECONDS : 0;

  return {
    id: `pod-${article.id}`,
    articleId: article.id,
    showName: "Analysis",
    title: article.title.slice(0, TITLE_MAX_CHARS),
    subtitle: article.subtitle,
    hosts: preset.hosts,
    format,
    durationSeconds,
    // Both filled in once the render completes.
    waveform: [],
    audioUrl: null,
    dialogue,
    // Filled from the reading layers once they arrive. The article's own
    // standfirst used to sit here, which repeated text already on screen.
    showNotes: "",
    keyTakeaways: [],
  };
};

/**
 * A summary is one job that writes and narrates in a single step, so unlike a
 * podcast there is no intermediate script to publish partway through. The
 * narration becomes a single turn, which is what the transcript renders.
 */
const produceSummary = async ({
  article,
  pairId,
  onReady,
}: ProductionRequest): Promise<ProducedAudio> => {
  const [{ audioUrl, text }, notes] = await Promise.all([
    renderSummary(article.id),
    fetchReadingLayers(article.id).catch(() => null),
  ]);
  onReady(buildEpisode(article, [{ speaker: "HostA", text }], pairId, "summary"));

  const waveform = await extractWaveform(audioUrl).catch(() => []);
  return { audioUrl, waveform, notes };
};

/** Script, then audio, then the waveform read off that audio. */
const produceEpisode = async ({
  article,
  pairId,
  format,
  onReady,
  onRenderProgress,
}: ProductionRequest): Promise<ProducedAudio> => {
  const script = await fetchScript(article.id);
  if (script.length === 0) {
    throw new Error("The generated script came back empty");
  }

  // The transcript is published as soon as it exists, so it is readable while
  // the voices are still being synthesised rather than only afterwards.
  onReady(buildEpisode(article, script, pairId, format));

  // Notes are written while the audio renders. Sequentially they would add
  // their own wait to a step that already takes a minute.
  const [audioUrl, notes] = await Promise.all([
    renderAudio(script, onRenderProgress),
    fetchReadingLayers(article.id).catch(() => null),
  ]);
  const waveform = await extractWaveform(audioUrl).catch(() => []);
  return { audioUrl, waveform, notes };
};

/**
 * Merges a finished production onto the episode already on screen, rather than
 * replacing it, so transcript edits made while the audio rendered survive.
 * Notes fall back to what is there, since a failed notes call resolves to null.
 */
export const applyProduction =
  ({ audioUrl, waveform, notes }: ProducedAudio) =>
  (prev: PodcastEpisode | null): PodcastEpisode | null =>
    prev
      ? {
          ...prev,
          audioUrl,
          waveform,
          showNotes: notes?.summary60s ?? prev.showNotes,
          keyTakeaways: notes?.keyPoints ?? prev.keyTakeaways,
        }
      : prev;

/** Picks the pipeline the chosen format needs. */
export const runProduction = (request: ProductionRequest): Promise<ProducedAudio> =>
  request.format === "summary" ? produceSummary(request) : produceEpisode(request);
