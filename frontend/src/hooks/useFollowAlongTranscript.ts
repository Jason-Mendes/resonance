import { useMemo } from "react";

import { useAudioPlayback } from "./useAudioPlayback";

import { findActiveTurnId, rescaleTurnTimings } from "@/lib/podcast-script";
import { PodcastEpisode } from "@/types/podcast";

/**
 * Playback state plus the turn being spoken. Owned above both the player and
 * the transcript, since each needs the same position and two separate players
 * would attach to different audio elements and disagree.
 */
export const useFollowAlongTranscript = (episode: PodcastEpisode | null) => {
  const playback = useAudioPlayback(episode?.audioUrl ?? null);

  // Estimated timings are stretched onto the rendered audio once its length is
  // known, so the highlighted turn matches the voice rather than drifting.
  const dialogue = useMemo(() => {
    if (!episode) return [];
    return playback.duration > 0
      ? rescaleTurnTimings(episode.dialogue, episode.durationSeconds, playback.duration)
      : episode.dialogue;
  }, [episode, playback.duration]);

  const activeTurnId = useMemo(
    () => (playback.isPlaying ? findActiveTurnId(dialogue, playback.currentTime) : null),
    [dialogue, playback.currentTime, playback.isPlaying],
  );

  return { playback, dialogue, activeTurnId };
};
