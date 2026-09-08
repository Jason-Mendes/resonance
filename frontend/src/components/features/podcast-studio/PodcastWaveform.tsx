import * as React from "react";

export interface PodcastWaveformProps {
  waveform: number[];
  progressPercent: number;
  onSeekRatio: (ratio: number) => void;
}

export const PodcastWaveform: React.FC<PodcastWaveformProps> = ({
  waveform,
  progressPercent,
  onSeekRatio,
}) => (
  <div className="flex items-end justify-between h-12 bg-zinc-50 p-2 gap-1 border border-zinc-100 rounded-none">
    {waveform.map((height, idx) => {
      const isPassed = progressPercent >= (idx / waveform.length) * 100;
      return (
        <div
          key={idx}
          className={`flex-1 transition-all duration-150 cursor-pointer rounded-none ${
            isPassed ? "bg-black" : "bg-zinc-200 hover:bg-zinc-300"
          }`}
          style={{ height: `${Math.max(15, (height / 100) * 100)}%` }}
          onClick={() => onSeekRatio(idx / waveform.length)}
        />
      );
    })}
  </div>
);
