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

export const usePodcastGeneration = (article: Article | null) => {
  const [selectedPairId, setSelectedPairId] = useState<string>(
    HOST_PAIR_PRESETS[0].id
  );
  const [selectedFormat, setSelectedFormat] = useState<PodcastFormat>("dialogue");
  const [genState, setGenState] = useState<PodcastGenState>("idle");
  const [progress, setProgress] = useState<number>(0);
  const [episode, setEpisode] = useState<PodcastEpisode | null>(null);

  useEffect(() => {
    if (!article) {
      setEpisode(null);
      setGenState("idle");
      return;
    }

    if (SAMPLE_PODCAST_MAP[article.id]) {
      setEpisode(SAMPLE_PODCAST_MAP[article.id]);
      setGenState("completed");
    } else {
      setEpisode(null);
      setGenState("idle");
    }
  }, [article]);

  const generatePodcast = useCallback(() => {
    if (!article) return;

    setGenState("generating");
    setProgress(15);

    setTimeout(() => setProgress(45), 350);
    setTimeout(() => setProgress(80), 750);

    setTimeout(() => {
      setProgress(100);
      setGenState("completed");
      const newEpisode = generatePodcastForArticle(
        article,
        selectedPairId,
        selectedFormat
      );
      setEpisode(newEpisode);
    }, 1100);
  }, [article, selectedPairId, selectedFormat]);

  const updateDialogue = useCallback(
    (updatedDialogue: PodcastDialogueTurn[]) => {
      setEpisode((prev) =>
        prev ? { ...prev, dialogue: updatedDialogue } : null
      );
    },
    []
  );

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
