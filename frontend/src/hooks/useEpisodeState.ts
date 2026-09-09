import { useState, useCallback, useEffect } from "react";

import { Article } from "@/types/article";
import { PodcastEpisode, PodcastFormat, PodcastGenState } from "@/types/podcast";

export interface FormatSlot {
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

const EMPTY_SLOTS: Record<PodcastFormat, FormatSlot> = {
  podcast: EMPTY_SLOT,
  summary: EMPTY_SLOT,
};

export const useEpisodeState = (article: Article | null, format: PodcastFormat) => {
  const [slots, setSlots] = useState<Record<PodcastFormat, FormatSlot>>(EMPTY_SLOTS);

  useEffect(() => {
    setSlots(EMPTY_SLOTS);
  }, [article]);

  const patch = useCallback(
    (change: Partial<FormatSlot>) => {
      setSlots((prev) => ({ ...prev, [format]: { ...prev[format], ...change } }));
    },
    [format],
  );

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
