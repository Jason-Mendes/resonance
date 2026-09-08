import { SAMPLE_PODCAST_MAP } from "@/constants/sample-podcast-episodes";
import { HOST_PAIR_PRESETS } from "@/constants/sample-podcast-hosts";
import { Article, ArticleSectionType } from "@/types/article";
import {
  PodcastChapter,
  PodcastDialogueTurn,
  PodcastEpisode,
  PodcastFormat,
  PodcastHost,
} from "@/types/podcast";

const FALLBACK_QUOTE = "The implications extend far beyond regional boundaries.";
const LEAD_EXCERPT_CHARS = 150;
const QUOTE_EXCERPT_CHARS = 140;
const TITLE_MAX_CHARS = 48;
const TAKEAWAY_EXCERPT_CHARS = 120;
const WAVEFORM = [20, 35, 55, 40, 75, 90, 65, 50, 85, 70, 45, 80, 60, 35, 75, 85, 50, 60, 30, 15];

const findSectionContent = (article: Article, type: ArticleSectionType) =>
  article.sections.find((section) => section.type === type)?.content;

const buildDialogue = (
  article: Article,
  hostA: PodcastHost,
  hostB: PodcastHost,
): PodcastDialogueTurn[] => {
  const leadText =
    findSectionContent(article, "lead") || article.sections[0]?.content || article.subtitle;
  const quoteText = findSectionContent(article, "quote") || FALLBACK_QUOTE;

  return [
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
      text: `Indeed, ${hostA.name}. As the reporting states: "${leadText.slice(0, LEAD_EXCERPT_CHARS)}..." This challenges previous assumptions.`,
    },
    {
      id: "gen-t3",
      speaker: hostA.name,
      speakerRole: hostA.role,
      timestamp: "1:05",
      timeSeconds: 65,
      text: `Looking at the central finding: "${quoteText.slice(0, QUOTE_EXCERPT_CHARS)}..." That captures the critical urgency.`,
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
};

const buildChapters = (article: Article): PodcastChapter[] => [
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
];

export const generatePodcastForArticle = (
  article: Article,
  pairId: string,
  format: PodcastFormat,
): PodcastEpisode => {
  if (SAMPLE_PODCAST_MAP[article.id]) {
    return SAMPLE_PODCAST_MAP[article.id];
  }

  const preset = HOST_PAIR_PRESETS.find((p) => p.id === pairId) || HOST_PAIR_PRESETS[0];
  const hostA = preset.hosts[0];
  const hostB = preset.hosts[1] || preset.hosts[0];

  return {
    id: `pod-${Date.now()}`,
    articleId: article.id,
    showName: "Analysis",
    title: article.title.slice(0, TITLE_MAX_CHARS),
    subtitle: article.subtitle,
    hosts: preset.hosts,
    format,
    durationSeconds: 210,
    formattedDuration: "3m 30s",
    waveform: WAVEFORM,
    chapters: buildChapters(article),
    dialogue: buildDialogue(article, hostA, hostB),
    showNotes: `Analysis of the story: "${article.title}". ${article.subtitle}`,
    keyTakeaways: [
      `Summary: ${article.subtitle.slice(0, TAKEAWAY_EXCERPT_CHARS)}...`,
      `By ${article.author.name}.`,
    ],
  };
};
