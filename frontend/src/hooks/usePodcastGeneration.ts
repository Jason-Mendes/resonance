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
/** Everything the studio shows for one format. */
interface FormatSlot {
  episode: PodcastEpisode | null;
  genState: PodcastGenState;
  progress: number;
  error: string | null;
}

const EMPTY_SLOT: FormatSlot = {
  episode: null,
  genState: "idle",
  progress: 0,
  error: null,
};

/**
 * One slot per format, so generating a summary no longer discards a podcast.
 * A Record over the format union rather than two fields, so adding a format
 * fails to compile until it has a slot.
 */
const EMPTY_SLOTS: Record<PodcastFormat, FormatSlot> = {
  podcast: EMPTY_SLOT,
  summary: EMPTY_SLOT,
};

/** The episode's lifecycle state, cleared whenever the article changes. */
const useEpisodeState = (article: Article | null, format: PodcastFormat) => {
  const [slots, setSlots] = useState<Record<PodcastFormat, FormatSlot>>(EMPTY_SLOTS);

  // Showing one article's script beside another article's text is worse than
  // showing none, so a change of article clears both formats.
  useEffect(() => {
    setSlots(EMPTY_SLOTS);
  }, [article]);

  /** Patches only the selected format, leaving the other one untouched. */
  const patch = useCallback(
    (change: Partial<FormatSlot>) => {
      setSlots((prev) => ({ ...prev, [format]: { ...prev[format], ...change } }));
    },
    [format],
  );

  /** Updates the selected format's episode from its own previous value. */
  const patchEpisode = useCallback(
    (next: (prev: PodcastEpisode | null) => PodcastEpisode | null) => {
      setSlots((prev) => ({
        ...prev,
        [format]: { ...prev[format], episode: next(prev[format].episode) },
      }));
    },
    [format],
  );

  return { slot: slots[format], patch, patchEpisode };
};

export const usePodcastGeneration = (article: Article | null) => {
  const [selectedPairId, setSelectedPairId] = useState<string>(HOST_PAIR_PRESETS[0].id);
  const [selectedFormat, setSelectedFormat] = useState<PodcastFormat>("podcast");
  const { slot, patch, patchEpisode } = useEpisodeState(article, selectedFormat);

  const generatePodcast = useCallback(async () => {
    if (!article) return;

    patch({ genState: "generating", error: null, progress: GENERATION_START_PROGRESS });

    try {
      const request: ProductionRequest = {
        article,
        pairId: selectedPairId,
        format: selectedFormat,
        onReady: (built) => patch({ episode: built, progress: SCRIPT_DONE_PROGRESS }),
        onRenderProgress: (fraction) => patch({ progress: renderProgressToBar(fraction) }),
      };

      const produced = await runProduction(request);

      patchEpisode(applyProduction(produced));
      patch({ progress: 100, genState: "completed" });
    } catch (caught) {
      patch({
        error: caught instanceof Error ? caught.message : "Could not generate the script",
        progress: 0,
        genState: "error",
      });
    }
  }, [article, selectedPairId, selectedFormat, patch, patchEpisode]);

  const updateDialogue = useCallback(
    (dialogue: PodcastDialogueTurn[]) => {
      patchEpisode((prev) => (prev ? { ...prev, dialogue } : null));
    },
    [patchEpisode],
  );

  return {
    selectedPairId,
    setSelectedPairId,
    selectedFormat,
    setSelectedFormat,
    genState: slot.genState,
    progress: slot.progress,
    episode: slot.episode,
    error: slot.error,
    generatePodcast,
    updateDialogue,
  };
};
