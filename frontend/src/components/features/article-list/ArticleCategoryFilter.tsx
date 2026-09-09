import * as React from "react";

export interface ArticleCategoryFilterProps {
  selectedTopic: string;
  onSelectTopic: (topic: string) => void;
  topics: string[];
  counts: Record<string, number>;
}

interface TopicPillProps {
  topic: string;
  active: boolean;
  count: number;
  onSelect: (topic: string) => void;
}

const TopicPill: React.FC<TopicPillProps> = ({ topic, active, count, onSelect }) => (
  <button
    type="button"
    onClick={() => onSelect(topic)}
    className={`px-2.5 py-1 text-xs font-mono transition-colors shrink-0 flex items-center gap-1.5 ${
      active ? "bg-black text-white font-medium" : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
    }`}
  >
    <span>{topic}</span>
    {count > 0 && (
      <span
        className={`text-[10px] px-1 py-0.2 ${
          active ? "bg-zinc-800 text-zinc-200" : "bg-zinc-200 text-zinc-600"
        }`}
      >
        {count}
      </span>
    )}
  </button>
);

export const ArticleCategoryFilter: React.FC<ArticleCategoryFilterProps> = ({
  selectedTopic,
  onSelectTopic,
  topics,
  counts,
}) => {
  if (topics.length === 0) return null;

  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-1">
      <span className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider shrink-0 mr-1">
        Podcast Topic:
      </span>
      <button
        type="button"
        onClick={() => onSelectTopic("all")}
        className={`px-2.5 py-1 text-xs font-mono transition-colors shrink-0 ${
          selectedTopic === "all"
            ? "bg-black text-white font-medium"
            : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
        }`}
      >
        All Topics
      </button>
      {topics.map((topic) => (
        <TopicPill
          key={topic}
          topic={topic}
          active={selectedTopic === topic}
          count={counts[topic] ?? 0}
          onSelect={onSelectTopic}
        />
      ))}
    </div>
  );
};
