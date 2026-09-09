import * as React from "react";

import { PodcastPlayerControls } from "./PodcastPlayerControls";
import { PodcastPlayerHeader } from "./PodcastPlayerHeader";
import { PodcastWaveform } from "./PodcastWaveform";

import { AudioPlayback } from "@/hooks/useAudioPlayback";
import { PodcastEpisode } from "@/types/podcast";

export interface PodcastPlayerCardProps {
  episode: PodcastEpisode;
  playback: AudioPlayback;
}

export const PodcastPlayerCard: React.FC<PodcastPlayerCardProps> = ({ episode, playback }) => {
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
  } = playback;

  // The rendered file's own length. Zero until its metadata loads, and the
  // word-count estimate is deliberately not used as a stand-in: it showed a
  // duration for audio that did not exist, then jumped when the real one
  // arrived.
  const trackSeconds = duration;
  const isReady = episode.audioUrl !== null;

  const handleSeek = (secs: number) => seekTo(secs);

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
          <span>{trackSeconds > 0 ? formatTime(trackSeconds) : "--:--"}</span>
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
    </div>
  );
};
