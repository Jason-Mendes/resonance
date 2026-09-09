import { useState, useCallback } from "react";

import { HOST_PAIR_PRESETS } from "@/constants/sample-podcast-hosts";
import { FormatSlot, useEpisodeState } from "@/hooks/useEpisodeState";
import { markArticleSynthesized } from "@/hooks/useSynthesizedArticles";
import { SCRIPT_DONE_PROGRESS } from "@/lib/podcast-api";
import {
  applyProduction,
  renderProgressToBar,
  resynthesizeScriptAudio,
  runProduction,
  type ProductionRequest,
} from "@/lib/podcast-production";
import { BackendScriptTurn } from "@/lib/podcast-script";
import { Article } from "@/types/article";
import { PodcastEpisode, PodcastFormat, PodcastDialogueTurn, VoicePair } from "@/types/podcast";

const GENERATION_START_PROGRESS = 15;

interface ResynthesisOptions {
  article: Article | null;
  episode: PodcastEpisode | null;
  selectedVoicePair: VoicePair;
  patch: (change: Partial<FormatSlot>) => void;
  patchEpisode: (next: (prev: PodcastEpisode | null) => PodcastEpisode | null) => void;
}

const toBackendTurns = (raw: unknown): BackendScriptTurn[] => {
  const turns = Array.isArray(raw) ? raw : [];
  return turns
    .filter((t) => typeof t?.text === "string" && t.text.trim().length > 0)
    .map((turn, i) => ({
      speaker: turn.speaker?.includes("1") || i % 2 === 0 ? "HostA" : "HostB",
      text: turn.text.trim(),
    }));
};

const useScriptResynthesis = ({
  article,
  episode,
  selectedVoicePair,
  patch,
  patchEpisode,
}: ResynthesisOptions) => {
  const resynthesizeAudio = useCallback(
    async (customDialogue?: unknown) => {
      if (!article) return;
      const turns = toBackendTurns(customDialogue ?? episode?.dialogue);
      if (turns.length === 0) return;

      patch({ genState: "generating", progress: 15, error: null });
      try {
        const { audioUrl, waveform } = await resynthesizeScriptAudio(
          turns,
          selectedVoicePair,
          (fraction) => patch({ progress: Math.round(15 + fraction * 85) }),
        );
        patchEpisode((prev) =>
          prev
            ? {
                ...prev,
                audioUrl,
                waveform,
                ...(Array.isArray(customDialogue) ? { dialogue: customDialogue } : {}),
              }
            : null,
        );
        patch({ progress: 100, genState: "completed" });
        markArticleSynthesized(article.id, episode?.topic);
      } catch (caught) {
        console.error("Re-synthesis error:", caught);
        patch({
          error: caught instanceof Error ? caught.message : "Re-synthesis failed",
          progress: 0,
          genState: "error",
        });
      }
    },
    [episode, article, selectedVoicePair, patch, patchEpisode],
  );

  return { resynthesizeAudio };
};

interface RunnerOptions {
  article: Article | null;
  selectedPairId: string;
  selectedVoicePair: VoicePair;
  selectedFormat: PodcastFormat;
  patch: (change: Partial<FormatSlot>) => void;
  patchEpisode: (next: (prev: PodcastEpisode | null) => PodcastEpisode | null) => void;
}

const usePodcastRunner = ({
  article,
  selectedPairId,
  selectedVoicePair,
  selectedFormat,
  patch,
  patchEpisode,
}: RunnerOptions) => {
  const generatePodcast = useCallback(async () => {
    if (!article) return;
    patch({ genState: "generating", error: null, progress: GENERATION_START_PROGRESS });

    try {
      let episodeTopic: string | undefined;
      const request: ProductionRequest = {
        article,
        pairId: selectedPairId,
        voicePair: selectedVoicePair,
        format: selectedFormat,
        onReady: (built) => {
          episodeTopic = built.topic;
          patch({ episode: built, progress: SCRIPT_DONE_PROGRESS });
          markArticleSynthesized(article.id, built.topic);
        },
        onRenderProgress: (fraction) => patch({ progress: renderProgressToBar(fraction) }),
      };

      const produced = await runProduction(request);
      patchEpisode(applyProduction(produced));
      patch({ progress: 100, genState: "completed" });
      markArticleSynthesized(article.id, episodeTopic);
    } catch (caught) {
      patch({
        error: caught instanceof Error ? caught.message : "Could not generate the script",
        progress: 0,
        genState: "error",
      });
    }
  }, [article, selectedPairId, selectedVoicePair, selectedFormat, patch, patchEpisode]);

  return { generatePodcast };
};

export const usePodcastGeneration = (article: Article | null) => {
  const [selectedPairId, setSelectedPairId] = useState<string>(HOST_PAIR_PRESETS[0].id);
  const [selectedVoicePair, setSelectedVoicePair] = useState<VoicePair>("male_female");
  const [selectedFormat, setSelectedFormat] = useState<PodcastFormat>("podcast");
  const { slot, patch, patchEpisode } = useEpisodeState(article, selectedFormat);

  const { resynthesizeAudio } = useScriptResynthesis({
    article,
    episode: slot.episode,
    selectedVoicePair,
    patch,
    patchEpisode,
  });

  const { generatePodcast } = usePodcastRunner({
    article,
    selectedPairId,
    selectedVoicePair,
    selectedFormat,
    patch,
    patchEpisode,
  });

  const updateDialogue = useCallback(
    (dialogue: PodcastDialogueTurn[]) => {
      patchEpisode((prev) => (prev ? { ...prev, dialogue } : null));
    },
    [patchEpisode],
  );

  return {
    selectedPairId,
    setSelectedPairId,
    selectedVoicePair,
    setSelectedVoicePair,
    selectedFormat,
    setSelectedFormat,
    genState: slot.genState,
    progress: slot.progress,
    episode: slot.episode,
    error: slot.error,
    generatePodcast,
    resynthesizeAudio,
    updateDialogue,
  };
};
