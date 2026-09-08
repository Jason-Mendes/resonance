import { Users } from "lucide-react";
import * as React from "react";

import { PodcastFormat } from "@/types/podcast";

interface FormatOption {
  id: PodcastFormat;
  label: string;
  sub: string;
  pairId: string;
}

const FORMAT_OPTIONS: FormatOption[] = [
  {
    id: "dialogue",
    label: "Dialogue",
    sub: "Host 1 & Host 2",
    pairId: "editorial-desk",
  },
  { id: "solo", label: "Solo", sub: "Host 1", pairId: "solo-dispatch" },
];

export interface PodcastFormatSelectorProps {
  selectedFormat: PodcastFormat;
  onSelectFormat: (format: PodcastFormat) => void;
  onSelectPairId: (id: string) => void;
}

export const PodcastFormatSelector: React.FC<PodcastFormatSelectorProps> = ({
  selectedFormat,
  onSelectFormat,
  onSelectPairId,
}) => (
  <div className="space-y-2">
    <label className="text-[11px] font-mono uppercase tracking-wider text-zinc-500 font-semibold flex items-center gap-1.5">
      <Users className="h-3 w-3 text-black" />
      Format
    </label>
    <div className="grid grid-cols-2 gap-2">
      {FORMAT_OPTIONS.map((item) => (
        <button
          key={item.id}
          type="button"
          onClick={() => {
            onSelectFormat(item.id);
            onSelectPairId(item.pairId);
          }}
          className={`p-3 border text-left transition-all rounded-none ${
            selectedFormat === item.id
              ? "border-black bg-zinc-50 text-black shadow-2xs"
              : "border-zinc-200 bg-white text-zinc-600 hover:border-zinc-400"
          }`}
        >
          <div className="text-xs font-semibold">{item.label}</div>
          <div className="text-[11px] text-zinc-500 mt-0.5">{item.sub}</div>
        </button>
      ))}
    </div>
  </div>
);
