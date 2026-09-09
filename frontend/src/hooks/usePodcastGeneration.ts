import { useState, useCallback, useEffect } from "react";

import { HOST_PAIR_PRESETS } from "@/constants/sample-podcast-hosts";
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

// A dialogue render takes upwards of a minute, so a slower poll costs nothing
// in perceived latency and keeps the request count low.
const POLL_INTERVAL_MS = 3_000;
const POLL_TIMEOUT_MS = 5 * 60 * 1000;
const SCRIPT_DONE_PROGRESS = 55;

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

interface JobStatus {
  status: "pending" | "running" | "done" | "failed";
  error?: string;
}

/** Starts a render and resolves with the audio URL once the job reports done. */
const renderAudio = async (script: BackendScriptTurn[]): Promise<string> => {
  const start = await fetch("/api/tts", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ script }),
  });

  const accepted: unknown = await start.json().catch(() => null);
  const jobId = (accepted as { jobId?: unknown })?.jobId;
  if (!start.ok || typeof jobId !== "string") {
    const message = (accepted as { error?: unknown })?.error;
    throw new Error(typeof message === "string" ? message : "Could not start the audio render");
  }

  const deadline = Date.now() + POLL_TIMEOUT_MS;
  while (Date.now() < deadline) {
    await wait(POLL_INTERVAL_MS);
    const poll = await fetch(`/api/tts/jobs/${jobId}`);
    const job = (await poll.json().catch(() => null)) as JobStatus | null;

    if (job?.status === "done") return `/api/tts/jobs/${jobId}/audio`;
    if (job?.status === "failed") throw new Error(job.error ?? "The audio render failed");
  }

  throw new Error("The audio render timed out");
};

/** Script, then audio, then the waveform read off that audio. */
const produceEpisode = async (
  article: Article,
  pairId: string,
  format: PodcastFormat,
  onScriptReady: (episode: PodcastEpisode) => void,
): Promise<{ audioUrl: string; waveform: number[] }> => {
  const script = await fetchScript(article.id);
  if (script.length === 0) {
    throw new Error("The generated script came back empty");
  }

  // The transcript is published as soon as it exists, so it is readable while
  // the voices are still being synthesised rather than only afterwards.
  onScriptReady(buildEpisode(article, script, pairId, format));

  const audioUrl = await renderAudio(script);
  const waveform = await extractWaveform(audioUrl).catch(() => []);
  return { audioUrl, waveform };
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
      const { audioUrl, waveform } = await produceEpisode(
        article,
        selectedPairId,
        selectedFormat,
        (built) => {
          setEpisode(built);
          setProgress(SCRIPT_DONE_PROGRESS);
        },
      );

      // Spread onto the previous state so transcript edits made while the audio
      // was rendering survive.
      setEpisode((prev) => (prev ? { ...prev, audioUrl, waveform } : prev));
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
