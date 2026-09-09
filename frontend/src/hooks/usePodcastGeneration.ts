import { useState, useCallback, useEffect } from "react";

import { HOST_PAIR_PRESETS } from "@/constants/sample-podcast-hosts";
import { SCRIPT_DONE_PROGRESS } from "@/lib/podcast-api";
import {
  applyProduction,
  renderProgressToBar,
  runProduction,
  type ProductionRequest,
} from "@/lib/podcast-production";
import { Article } from "@/types/article";
import {
  PodcastEpisode,
  PodcastFormat,
  PodcastGenState,
  PodcastDialogueTurn,
} from "@/types/podcast";

const GENERATION_START_PROGRESS = 15;
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

      const request: ProductionRequest = {
        article,
        pairId: selectedPairId,
        format: selectedFormat,
        onReady,
        onRenderProgress: (fraction) => setProgress(renderProgressToBar(fraction)),
      };

      const produced = await runProduction(request);

      setEpisode(applyProduction(produced));
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
