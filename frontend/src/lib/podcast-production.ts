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
import { PodcastEpisode, PodcastFormat, PodcastHost, VoicePair } from "@/types/podcast";

const TITLE_MAX_CHARS = 48;
const TRAILING_TURN_SECONDS = 20;

export const renderProgressToBar = (fraction: number): number =>
  Math.round(SCRIPT_DONE_PROGRESS + fraction * (100 - SCRIPT_DONE_PROGRESS));

export interface ProductionRequest {
  article: Article;
  pairId: string;
  format: PodcastFormat;
  voicePair?: VoicePair;
  onReady: (episode: PodcastEpisode) => void;
  onRenderProgress: (fraction: number) => void;
}

interface BuildEpisodeInput {
  article: Article;
  script: BackendScriptTurn[];
  pairId: string;
  format: PodcastFormat;
  customHosts?: PodcastHost[];
  topic?: string;
}

const buildEpisode = ({
  article,
  script,
  pairId,
  format,
  customHosts,
  topic,
}: BuildEpisodeInput): PodcastEpisode => {
  const preset = HOST_PAIR_PRESETS.find((p) => p.id === pairId) ?? HOST_PAIR_PRESETS[0];
  const hosts = customHosts && customHosts.length > 0 ? customHosts : preset.hosts;
  const dialogue = toDialogueTurns(script, hosts);
  const lastTurn = dialogue[dialogue.length - 1];
  const durationSeconds = lastTurn ? lastTurn.timeSeconds + TRAILING_TURN_SECONDS : 0;

  return {
    id: `pod-${article.id}`,
    articleId: article.id,
    showName: "Analysis",
    topic: topic || "General",
    title: article.title.slice(0, TITLE_MAX_CHARS),
    subtitle: article.subtitle,
    hosts,
    format,
    durationSeconds,
    waveform: [],
    audioUrl: null,
    dialogue,
    showNotes: "",
    keyTakeaways: [],
  };
};

const produceSummary = async ({
  article,
  pairId,
  onReady,
}: ProductionRequest): Promise<ProducedAudio> => {
  const [{ audioUrl, text }, notes] = await Promise.all([
    renderSummary(article.id),
    fetchReadingLayers(article.id).catch(() => null),
  ]);
  onReady(
    buildEpisode({
      article,
      script: [{ speaker: "HostA", text }],
      pairId,
      format: "summary",
    }),
  );

  const waveform = await extractWaveform(audioUrl).catch(() => []);
  return { audioUrl, waveform, notes };
};

const produceEpisode = async ({
  article,
  pairId,
  format,
  voicePair,
  onReady,
  onRenderProgress,
}: ProductionRequest): Promise<ProducedAudio> => {
  const { script, hosts, topic } = await fetchScript(article.id, voicePair);
  if (script.length === 0) {
    throw new Error("The generated script came back empty");
  }

  const mappedHosts: PodcastHost[] | undefined = hosts?.map((h) => ({
    id: h.id,
    name: h.name,
    role: h.role,
    accent: "Standard Broadcast",
    voiceTag: h.voice,
  }));

  onReady(
    buildEpisode({
      article,
      script,
      pairId,
      format,
      customHosts: mappedHosts,
      topic,
    }),
  );

  const [audioUrl, notes] = await Promise.all([
    renderAudio(script, onRenderProgress, voicePair),
    fetchReadingLayers(article.id).catch(() => null),
  ]);
  const waveform = await extractWaveform(audioUrl).catch(() => []);
  return { audioUrl, waveform, notes };
};

export const resynthesizeScriptAudio = async (
  script: BackendScriptTurn[],
  voicePair?: VoicePair,
  onProgress?: (fraction: number) => void,
): Promise<{ audioUrl: string; waveform: number[] }> => {
  const audioUrl = await renderAudio(script, onProgress, voicePair);
  const waveform = await extractWaveform(audioUrl).catch(() => []);
  return { audioUrl, waveform };
};

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

export const runProduction = (request: ProductionRequest): Promise<ProducedAudio> =>
  request.format === "summary" ? produceSummary(request) : produceEpisode(request);
