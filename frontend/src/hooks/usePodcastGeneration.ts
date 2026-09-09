import { useState, useCallback, useEffect } from "react";

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
import {
  PodcastEpisode,
  PodcastFormat,
  PodcastGenState,
  PodcastDialogueTurn,
} from "@/types/podcast";

const GENERATION_START_PROGRESS = 15;
const TITLE_MAX_CHARS = 48;
const TRAILING_TURN_SECONDS = 20;

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
const produceSummary = async (
  article: Article,
  pairId: string,
  onReady: (episode: PodcastEpisode) => void,
): Promise<ProducedAudio> => {
  const [{ audioUrl, text }, notes] = await Promise.all([
    renderSummary(article.id),
    fetchReadingLayers(article.id).catch(() => null),
  ]);
  onReady(buildEpisode(article, [{ speaker: "HostA", text }], pairId, "summary"));

  const waveform = await extractWaveform(audioUrl).catch(() => []);
  return { audioUrl, waveform, notes };
};

/** Script, then audio, then the waveform read off that audio. */
const produceEpisode = async (
  article: Article,
  pairId: string,
  format: PodcastFormat,
  onScriptReady: (episode: PodcastEpisode) => void,
): Promise<ProducedAudio> => {
  const script = await fetchScript(article.id);
  if (script.length === 0) {
    throw new Error("The generated script came back empty");
  }

  // The transcript is published as soon as it exists, so it is readable while
  // the voices are still being synthesised rather than only afterwards.
  onScriptReady(buildEpisode(article, script, pairId, format));

  // Notes are written while the audio renders. Sequentially they would add
  // their own wait to a step that already takes a minute.
  const [audioUrl, notes] = await Promise.all([
    renderAudio(script),
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
const applyProduction =
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

/** The episode's lifecycle state, cleared whenever the article changes. */
const useEpisodeState = (article: Article | null) => {
  const [genState, setGenState] = useState<PodcastGenState>("idle");
  const [progress, setProgress] = useState<number>(0);
  const [episode, setEpisode] = useState<PodcastEpisode | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Showing one article's script beside another article's text is worse than
  // showing none, so a change of article clears everything.
  useEffect(() => {
    setEpisode(null);
    setGenState("idle");
    setProgress(0);
    setError(null);
  }, [article]);

  return {
    genState,
    setGenState,
    progress,
    setProgress,
    episode,
    setEpisode,
    error,
    setError,
  };
};

export const usePodcastGeneration = (article: Article | null) => {
  const [selectedPairId, setSelectedPairId] = useState<string>(HOST_PAIR_PRESETS[0].id);
  const [selectedFormat, setSelectedFormat] = useState<PodcastFormat>("podcast");
  const { genState, setGenState, progress, setProgress, episode, setEpisode, error, setError } =
    useEpisodeState(article);

  const generatePodcast = useCallback(async () => {
    if (!article) return;

    setGenState("generating");
    setError(null);
    setProgress(GENERATION_START_PROGRESS);

    try {
      const onReady = (built: PodcastEpisode) => {
        setEpisode(built);
        setProgress(SCRIPT_DONE_PROGRESS);
      };

      const { audioUrl, waveform, notes } =
        selectedFormat === "summary"
          ? await produceSummary(article, selectedPairId, onReady)
          : await produceEpisode(article, selectedPairId, selectedFormat, onReady);

      setEpisode(applyProduction({ audioUrl, waveform, notes }));
      setProgress(100);
      setGenState("completed");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not generate the script");
      setProgress(0);
      setGenState("error");
    }
  }, [article, selectedPairId, selectedFormat]);

  const updateDialogue = useCallback((dialogue: PodcastDialogueTurn[]) => {
    setEpisode((prev) => (prev ? { ...prev, dialogue } : null));
  }, []);

  return {
    selectedPairId,
    setSelectedPairId,
    selectedFormat,
    setSelectedFormat,
    genState,
    progress,
    episode,
    error,
    generatePodcast,
    updateDialogue,
  };
};
