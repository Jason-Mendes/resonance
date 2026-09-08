import * as React from "react";
import { PodcastEpisode } from "@/types/podcast";
import { useAudioPlayback } from "@/hooks/useAudioPlayback";
import { PodcastPlayerHeader } from "./PodcastPlayerHeader";
import { PodcastWaveform } from "./PodcastWaveform";
import { PodcastPlayerControls } from "./PodcastPlayerControls";
import { PodcastChapterList } from "./PodcastChapterList";

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
    isPlaying,
    currentTime,
    playbackSpeed,
    togglePlay,
    seekTo,
    cycleSpeed,
    formatTime,
  } = useAudioPlayback(episode.durationSeconds);

  const handleSeek = (secs: number) => {
    seekTo(secs);
    if (onSeekRequested) onSeekRequested(secs);
  };

  return (
    <div className="border border-zinc-200 bg-white p-4 space-y-3.5 rounded-none">
      <PodcastPlayerHeader episode={episode} />

      <PodcastWaveform
        waveform={episode.waveform}
        progressPercent={(currentTime / episode.durationSeconds) * 100}
        onSeekRatio={(ratio) => handleSeek(ratio * episode.durationSeconds)}
      />

      <div className="space-y-1.5">
        <div className="flex justify-between text-[11px] font-mono text-zinc-400">
          <span>{formatTime(currentTime)}</span>
          <span>{episode.formattedDuration}</span>
        </div>

        <PodcastPlayerControls
          isPlaying={isPlaying}
          playbackSpeed={playbackSpeed}
          onTogglePlay={togglePlay}
          onRestart={() => handleSeek(0)}
          onCycleSpeed={cycleSpeed}
        />
      </div>

      <PodcastChapterList chapters={episode.chapters} onSeek={handleSeek} />
    </div>
  );
};
