import { Volume2 } from "lucide-react";
import * as React from "react";

import { VoicePair } from "@/types/podcast";

interface VoiceOption {
  id: VoicePair;
  label: string;
  sub: string;
}

const VOICE_OPTIONS: VoiceOption[] = [
  { id: "male_female", label: "Male & Female", sub: "Marcus & Elena (Default)" },
  { id: "female_female", label: "Female & Female", sub: "Elena & Klara" },
  { id: "male_male", label: "Male & Male", sub: "Marcus & David" },
];

export interface VoicePairSelectorProps {
  selectedVoicePair: VoicePair;
  onSelectVoicePair: (pair: VoicePair) => void;
  disabled?: boolean;
}

export const VoicePairSelector: React.FC<VoicePairSelectorProps> = ({
  selectedVoicePair,
  onSelectVoicePair,
  disabled = false,
}) => (
  <div className="space-y-2">
    <label className="text-[11px] font-mono uppercase tracking-wider text-zinc-500 font-semibold flex items-center gap-1.5">
      <Volume2 className="h-3 w-3 text-black" />
      Voice Combination
    </label>
    <div className="grid grid-cols-1 gap-1.5">
      {VOICE_OPTIONS.map((item) => {
        const isSelected = selectedVoicePair === item.id;
        return (
          <button
            key={item.id}
            type="button"
            disabled={disabled}
            onClick={() => onSelectVoicePair(item.id)}
            className={`p-2.5 border text-left transition-all rounded-none flex items-center justify-between ${
              isSelected
                ? "border-black bg-zinc-50 text-black shadow-2xs"
                : "border-zinc-200 bg-white text-zinc-600 hover:border-zinc-400"
            } ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
          >
            <div>
              <div className="text-xs font-semibold">{item.label}</div>
              <div className="text-[11px] text-zinc-500 mt-0.5">{item.sub}</div>
            </div>
            {isSelected && (
              <span className="h-2 w-2 rounded-full bg-black shrink-0" aria-hidden="true" />
            )}
          </button>
        );
      })}
    </div>
  </div>
);
