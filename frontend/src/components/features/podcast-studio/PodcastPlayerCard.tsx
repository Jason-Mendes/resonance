import * as React from "react";
import { Play, Pause, RotateCcw, Volume2, Bookmark } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { PodcastEpisode } from "@/types/podcast";
import { useAudioPlayback } from "@/hooks/useAudioPlayback";

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

  const progressPercent = (currentTime / episode.durationSeconds) * 100;

  return (
    <div className="border border-zinc-200 bg-white p-4 space-y-3.5 rounded-none">
      {/* Header Info */}
      <div className="flex items-start justify-between gap-2">
        <div className="space-y-0.5">
          <Badge variant="editorial" className="text-[10px] rounded-none">
            {episode.showName}
          </Badge>
          <h3 className="text-sm font-bold text-black leading-tight line-clamp-1">
            {episode.title}
          </h3>
        </div>
        <div className="flex items-center gap-1 text-zinc-500 bg-zinc-100 px-2 py-0.5 text-[11px] font-mono shrink-0 rounded-none">
          <Volume2 className="h-3 w-3 text-black" />
          <span>Audio</span>
        </div>
      </div>

      {/* Voices Display */}
      <div className="flex items-center gap-2 pt-1 border-t border-zinc-100">
        <span className="text-[10px] font-mono text-zinc-400 uppercase">
          Voices:
        </span>
        <div className="flex items-center gap-2">
          {episode.hosts.map((h, idx) => (
            <div
              key={h.id}
              className="flex items-center gap-1 bg-zinc-50 px-2 py-0.5 border border-zinc-200 rounded-none"
            >
              <span className="text-[10px] font-mono font-bold text-black">
                H{idx + 1}:
              </span>
              <span className="text-[11px] font-medium text-black">
                {h.name}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Waveform */}
      <div className="flex items-end justify-between h-12 bg-zinc-50 p-2 gap-1 border border-zinc-100 rounded-none">
        {episode.waveform.map((height, idx) => {
          const barProgress = (idx / episode.waveform.length) * 100;
          const isPassed = progressPercent >= barProgress;
          return (
            <div
              key={idx}
              className={`flex-1 transition-all duration-150 cursor-pointer rounded-none ${
                isPassed ? "bg-black" : "bg-zinc-200 hover:bg-zinc-300"
              }`}
              style={{
                height: `${Math.max(15, (height / 100) * 100)}%`,
              }}
              onClick={() =>
                handleSeek((idx / episode.waveform.length) * episode.durationSeconds)
              }
            />
          );
        })}
      </div>

      {/* Time & Controls */}
      <div className="space-y-1.5">
        <div className="flex justify-between text-[11px] font-mono text-zinc-400">
          <span>{formatTime(currentTime)}</span>
          <span>{episode.formattedDuration}</span>
        </div>

        <div className="flex items-center justify-between pt-0.5">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleSeek(0)}
            className="h-8 text-xs text-zinc-500 hover:text-black rounded-none"
          >
            <RotateCcw className="h-3 w-3 mr-1" />
            Restart
          </Button>

          <Button
            size="sm"
            onClick={togglePlay}
            className="h-8 px-5 gap-1.5 bg-black hover:bg-zinc-800 text-white rounded-none"
          >
            {isPlaying ? (
              <>
                <Pause className="h-3.5 w-3.5" />
                <span>Pause</span>
              </>
            ) : (
              <>
                <Play className="h-3.5 w-3.5 fill-white" />
                <span>Play</span>
              </>
            )}
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={cycleSpeed}
            className="h-8 px-2 font-mono text-xs border-zinc-200 rounded-none"
          >
            {playbackSpeed}x
          </Button>
        </div>
      </div>

      {/* Chapters */}
      <div className="space-y-1 pt-2 border-t border-zinc-100">
        <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 font-semibold flex items-center gap-1">
          <Bookmark className="h-3 w-3 text-black" />
          Chapters
        </span>
        <div className="space-y-0.5">
          {episode.chapters.map((ch) => (
            <button
              key={ch.id}
              type="button"
              onClick={() => handleSeek(ch.time)}
              className="w-full flex items-center justify-between text-left text-xs p-1 rounded-none hover:bg-zinc-50 transition-colors"
            >
              <span className="font-mono text-black text-[11px] font-semibold">
                {ch.formattedTime}
              </span>
              <span className="text-zinc-600 truncate max-w-[200px]">
                {ch.title}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
