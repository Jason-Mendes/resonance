import { useState, useEffect, useCallback, useRef } from "react";

import { formatTimestamp } from "@/lib/podcast-script";

const SPEED_CYCLE = [1, 1.25, 1.5] as const;
type PlaybackSpeed = (typeof SPEED_CYCLE)[number];

/** What the element reports about itself, mirrored into React state. */
const useAudioElementState = (
  audioRef: React.RefObject<HTMLAudioElement | null>,
  audioUrl: string | null,
) => {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);

  useEffect(() => {
    const audio = audioRef.current;
    // Each new track begins stopped, at zero, with its length still unknown.
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);
    if (!audio) return;

    const onTime = () => setCurrentTime(audio.currentTime);
    const onLoaded = () => setDuration(Number.isFinite(audio.duration) ? audio.duration : 0);
    const onPlaying = () => setIsPlaying(true);
    const onStopped = () => setIsPlaying(false);

    audio.addEventListener("timeupdate", onTime);
    audio.addEventListener("loadedmetadata", onLoaded);
    audio.addEventListener("play", onPlaying);
    audio.addEventListener("pause", onStopped);
    audio.addEventListener("ended", onStopped);

    return () => {
      audio.removeEventListener("timeupdate", onTime);
      audio.removeEventListener("loadedmetadata", onLoaded);
      audio.removeEventListener("play", onPlaying);
      audio.removeEventListener("pause", onStopped);
      audio.removeEventListener("ended", onStopped);
    };
  }, [audioRef, audioUrl]);

  return { isPlaying, currentTime, duration, setIsPlaying, setCurrentTime };
};

/**
 * Drives a real audio element. The element is the single source of truth for
 * playback: React state mirrors what it reports rather than tracking time
 * independently, so seeking, buffering and reaching the end all stay in step.
 */
export const useAudioPlayback = (audioUrl: string | null) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playbackSpeed, setPlaybackSpeed] = useState<PlaybackSpeed>(1);
  const { isPlaying, currentTime, duration, setIsPlaying, setCurrentTime } = useAudioElementState(
    audioRef,
    audioUrl,
  );

  // Set on the element so a speed change applies mid-playback.
  useEffect(() => {
    if (audioRef.current) audioRef.current.playbackRate = playbackSpeed;
  }, [playbackSpeed]);

  const togglePlay = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) {
      // play() rejects when the browser blocks autoplay or the source failed.
      void audio.play().catch(() => setIsPlaying(false));
    } else {
      audio.pause();
    }
  }, []);

  const seekTo = useCallback((seconds: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = seconds;
    setCurrentTime(seconds);
  }, []);

  const cycleSpeed = useCallback(() => {
    setPlaybackSpeed((prev) => SPEED_CYCLE[(SPEED_CYCLE.indexOf(prev) + 1) % SPEED_CYCLE.length]);
  }, []);

  return {
    audioRef,
    isPlaying,
    currentTime,
    duration,
    playbackSpeed,
    togglePlay,
    seekTo,
    cycleSpeed,
    formatTime: formatTimestamp,
  };
};
