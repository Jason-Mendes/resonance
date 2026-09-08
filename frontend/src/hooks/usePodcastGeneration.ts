import { useState, useCallback, useEffect } from "react";
import { Article } from "@/types/article";
import {
  PodcastEpisode,
  PodcastFormat,
  PodcastGenState,
  PodcastDialogueTurn,
} from "@/types/podcast";
import { SAMPLE_PODCAST_MAP } from "@/constants/sample-podcast-episodes";
import { HOST_PAIR_PRESETS } from "@/constants/sample-podcast-hosts";
import { generatePodcastForArticle } from "@/lib/podcast-generator";

const PROGRESS_STEPS = [
  { at: 350, value: 45 },
  { at: 750, value: 80 },
];
const SYNTHESIS_DURATION_MS = 1100;

export const usePodcastGeneration = (article: Article | null) => {
  const [selectedPairId, setSelectedPairId] = useState<string>(
    HOST_PAIR_PRESETS[0].id
  );
  const [selectedFormat, setSelectedFormat] = useState<PodcastFormat>("dialogue");
  const [genState, setGenState] = useState<PodcastGenState>("idle");
  const [progress, setProgress] = useState<number>(0);
  const [episode, setEpisode] = useState<PodcastEpisode | null>(null);

  useEffect(() => {
    const prebuilt = article ? SAMPLE_PODCAST_MAP[article.id] : undefined;
    setEpisode(prebuilt ?? null);
    setGenState(prebuilt ? "completed" : "idle");
  }, [article]);

  const generatePodcast = useCallback(() => {
    if (!article) return;

    setGenState("generating");
    setProgress(15);
    PROGRESS_STEPS.forEach((step) => {
      setTimeout(() => setProgress(step.value), step.at);
    });

    setTimeout(() => {
      setProgress(100);
      setGenState("completed");
      setEpisode(
        generatePodcastForArticle(article, selectedPairId, selectedFormat)
      );
    }, SYNTHESIS_DURATION_MS);
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
    generatePodcast,
    updateDialogue,
  };
};
