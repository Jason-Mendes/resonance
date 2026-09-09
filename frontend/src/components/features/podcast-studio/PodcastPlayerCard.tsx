import * as React from "react";

import { PodcastChapterList } from "./PodcastChapterList";
import { PodcastPlayerControls } from "./PodcastPlayerControls";
import { PodcastPlayerHeader } from "./PodcastPlayerHeader";
import { PodcastWaveform } from "./PodcastWaveform";

import { useAudioPlayback } from "@/hooks/useAudioPlayback";
import { PodcastEpisode } from "@/types/podcast";

export interface PodcastPlayerCardProps {
  episode: PodcastEpisode;
  activeTimestampSeconds?: number;
  onSeekRequested?: (seconds: number) => void;
}

export const PodcastPlayerCard: React.FC<PodcastPlayerCardProps> = ({
  episode,
  onSeekRequested,
}) => {
  const {
    audioRef,
    isPlaying,
    currentTime,
    duration,
    playbackSpeed,
    togglePlay,
    seekTo,
    cycleSpeed,
    formatTime,
  } = useAudioPlayback(episode.audioUrl);

  // The rendered file's own length once known, falling back to the script
  // estimate while metadata is still loading.
  const trackSeconds = duration || episode.durationSeconds;
  const isReady = episode.audioUrl !== null;

  const handleSeek = (secs: number) => {
    seekTo(secs);
    if (onSeekRequested) onSeekRequested(secs);
  };

  return (
    <div className="border border-zinc-200 bg-white p-4 space-y-3.5 rounded-none">
      <PodcastPlayerHeader episode={episode} />

      {episode.audioUrl && (
        <audio ref={audioRef} src={episode.audioUrl} preload="metadata" className="hidden" />
      )}

      <PodcastWaveform
        waveform={episode.waveform}
        progressPercent={trackSeconds > 0 ? (currentTime / trackSeconds) * 100 : 0}
        onSeekRatio={(ratio) => handleSeek(ratio * trackSeconds)}
      />

      <div className="space-y-1.5">
        <div className="flex justify-between text-[11px] font-mono text-zinc-400">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(trackSeconds)}</span>
        </div>

        <PodcastPlayerControls
          isPlaying={isPlaying}
          playbackSpeed={playbackSpeed}
          disabled={!isReady}
          onTogglePlay={togglePlay}
          onRestart={() => handleSeek(0)}
          onCycleSpeed={cycleSpeed}
        />
      </div>

      <PodcastChapterList chapters={episode.chapters} onSeek={handleSeek} />
    </div>
  );
};
