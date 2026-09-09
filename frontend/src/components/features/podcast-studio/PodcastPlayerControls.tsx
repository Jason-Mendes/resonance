import { Play, Pause, RotateCcw } from "lucide-react";
import * as React from "react";

import { Button } from "@/components/ui/Button";

export interface PodcastPlayerControlsProps {
  isPlaying: boolean;
  playbackSpeed: number;
  /** True while the audio is still rendering and there is nothing to play. */
  disabled: boolean;
  onTogglePlay: () => void;
  onRestart: () => void;
  onCycleSpeed: () => void;
}

export const PodcastPlayerControls: React.FC<PodcastPlayerControlsProps> = ({
  isPlaying,
  playbackSpeed,
  disabled,
  onTogglePlay,
  onRestart,
  onCycleSpeed,
}) => (
  <div className="flex items-center justify-between pt-0.5">
    <Button
      variant="ghost"
      size="sm"
      onClick={onRestart}
      disabled={disabled}
      className="h-8 text-xs text-zinc-500 hover:text-black rounded-none disabled:opacity-40"
    >
      <RotateCcw className="h-3 w-3 mr-1" />
      Restart
    </Button>

    <Button
      size="sm"
      onClick={onTogglePlay}
      disabled={disabled}
      className="h-8 px-5 gap-1.5 bg-black hover:bg-zinc-800 text-white rounded-none disabled:opacity-40"
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
      onClick={onCycleSpeed}
      className="h-8 px-2 font-mono text-xs border-zinc-200 rounded-none"
    >
      {playbackSpeed}x
    </Button>
  </div>
);
