import { useState, useCallback, useEffect } from "react";

import { HOST_PAIR_PRESETS } from "@/constants/sample-podcast-hosts";
import { BackendScriptTurn, formatTimestamp, toDialogueTurns } from "@/lib/podcast-script";
import { Article } from "@/types/article";
import {
  PodcastChapter,
  PodcastEpisode,
  PodcastFormat,
  PodcastGenState,
  PodcastDialogueTurn,
} from "@/types/podcast";

const GENERATION_START_PROGRESS = 15;
const TITLE_MAX_CHARS = 48;
const TRAILING_TURN_SECONDS = 20;
const CHAPTER_SUMMARY_CHARS = 90;

/** One chapter per turn is noise, so chapters mark each change of speaker. */
const buildChapters = (dialogue: PodcastDialogueTurn[]): PodcastChapter[] =>
  dialogue
    .filter((turn, index) => index === 0 || turn.speaker !== dialogue[index - 1].speaker)
    .map((turn) => ({
      id: `chapter-${turn.id}`,
      time: turn.timeSeconds,
      formattedTime: turn.timestamp,
      title: turn.speaker,
      summary: turn.text.slice(0, CHAPTER_SUMMARY_CHARS),
    }));

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
    formattedDuration: formatTimestamp(durationSeconds),
    // Filled in once audio exists to measure.
    waveform: [],
    chapters: buildChapters(dialogue),
    dialogue,
    showNotes: article.subtitle,
    keyTakeaways: article.summaryBullets ?? [],
  };
};

const fetchScript = async (articleId: string): Promise<BackendScriptTurn[]> => {
  const response = await fetch("/api/podcast", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ articleId }),
  });

  const payload: unknown = await response.json().catch(() => null);
  if (!response.ok) {
    const message = (payload as { error?: unknown })?.error;
    throw new Error(typeof message === "string" ? message : "Could not generate the script");
  }

  return ((payload as { script?: BackendScriptTurn[] })?.script ?? []).filter(
    (turn) => typeof turn?.text === "string" && turn.text.trim() !== "",
  );
};

/** Generates the script and builds the episode it describes. */
const produceEpisode = async (
  article: Article,
  pairId: string,
  format: PodcastFormat,
): Promise<PodcastEpisode> => {
  const script = await fetchScript(article.id);
  if (script.length === 0) {
    throw new Error("The generated script came back empty");
  }
  return buildEpisode(article, script, pairId, format);
};

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
  const [selectedFormat, setSelectedFormat] = useState<PodcastFormat>("dialogue");
  const { genState, setGenState, progress, setProgress, episode, setEpisode, error, setError } =
    useEpisodeState(article);

  const generatePodcast = useCallback(async () => {
    if (!article) return;

    setGenState("generating");
    setError(null);
    setProgress(GENERATION_START_PROGRESS);

    try {
      setEpisode(await produceEpisode(article, selectedPairId, selectedFormat));
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
