import { Article } from "@/types/article";
import { PodcastEpisode, PodcastFormat } from "@/types/podcast";
import { HOST_PAIR_PRESETS } from "@/constants/sample-podcast-hosts";
import { SAMPLE_PODCAST_MAP } from "@/constants/sample-podcast-episodes";

export const generatePodcastForArticle = (
  article: Article,
  pairId: string,
  format: PodcastFormat
): PodcastEpisode => {
  if (SAMPLE_PODCAST_MAP[article.id]) {
    return SAMPLE_PODCAST_MAP[article.id];
  }

  const selectedPreset =
    HOST_PAIR_PRESETS.find((p) => p.id === pairId) || HOST_PAIR_PRESETS[0];

  const hostA = selectedPreset.hosts[0];
  const hostB = selectedPreset.hosts[1] || selectedPreset.hosts[0];

  const leadText =
    article.sections.find((s) => s.type === "lead")?.content ||
    article.sections[0]?.content ||
    article.subtitle;

  const quoteText =
    article.sections.find((s) => s.type === "quote")?.content ||
    "The implications extend far beyond regional boundaries.";

  const dialogue = [
    {
      id: "gen-t1",
      speaker: hostA.name,
      speakerRole: hostA.role,
      timestamp: "0:00",
      timeSeconds: 0,
      text: `Today we examine the report: "${article.title}". ${hostB.name}, this reporting addresses the core issue directly.`,
    },
    {
      id: "gen-t2",
      speaker: hostB.name,
      speakerRole: hostB.role,
      timestamp: "0:25",
      timeSeconds: 25,
      text: `Indeed, ${hostA.name}. As the reporting states: "${leadText.slice(0, 150)}..." This challenges previous assumptions.`,
    },
    {
      id: "gen-t3",
      speaker: hostA.name,
      speakerRole: hostA.role,
      timestamp: "1:05",
      timeSeconds: 65,
      text: `Looking at the central finding: "${quoteText.slice(0, 140)}..." That captures the critical urgency.`,
    },
    {
      id: "gen-t4",
      speaker: hostB.name,
      speakerRole: hostB.role,
      timestamp: "1:40",
      timeSeconds: 100,
      text: `Exactly. The detailed data points in the manuscript provide the complete picture.`,
    },
  ];

  return {
    id: `pod-${Date.now()}`,
    articleId: article.id,
    showName: "Analysis",
    title: article.title.slice(0, 48),
    subtitle: article.subtitle,
    hosts: selectedPreset.hosts,
    format,
    durationSeconds: 210,
    formattedDuration: "3m 30s",
    waveform: [20, 35, 55, 40, 75, 90, 65, 50, 85, 70, 45, 80, 60, 35, 75, 85, 50, 60, 30, 15],
    chapters: [
      {
        id: "gc-1",
        time: 0,
        formattedTime: "0:00",
        title: "Overview",
        summary: `Overview of ${article.title}`,
      },
      {
        id: "gc-2",
        time: 65,
        formattedTime: "1:05",
        title: "Key Evidence",
        summary: "Analysis of reporting findings.",
      },
    ],
    dialogue,
    showNotes: `Analysis of the story: "${article.title}". ${article.subtitle}`,
    keyTakeaways: [
      `Summary: ${article.subtitle.slice(0, 120)}...`,
      `By ${article.author.name}.`,
    ],
  };
};
