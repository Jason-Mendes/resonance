import { ArticleFilter } from "./ArticleFilterTabs";

import { ArticleSummary } from "@/hooks/useArticlesQuery";

export interface FilterArticleOptions {
  query: string;
  filter: ArticleFilter;
  isSynthesized: (id: string) => boolean;
  selectedTopic?: string;
  getTopic?: (id: string) => string | undefined;
}

export const filterArticles = (
  articles: ArticleSummary[] | undefined,
  options: FilterArticleOptions,
): ArticleSummary[] => {
  if (!articles) return [];
  const { query, filter, isSynthesized, selectedTopic, getTopic } = options;
  const normalizedQuery = query.trim().toLowerCase();

  return articles.filter((article) => {
    const matchesSearch =
      !normalizedQuery ||
      article.title.toLowerCase().includes(normalizedQuery) ||
      article.subtitle.toLowerCase().includes(normalizedQuery) ||
      article.kicker.toLowerCase().includes(normalizedQuery) ||
      article.author.name.toLowerCase().includes(normalizedQuery);

    if (!matchesSearch) return false;

    const synthesized = isSynthesized(article.id);
    if (filter === "synthesized" && !synthesized) return false;
    if (filter === "unsynthesized" && synthesized) return false;

    if (selectedTopic && selectedTopic !== "all") {
      const topic = getTopic?.(article.id);
      if (!topic || topic.toLowerCase() !== selectedTopic.toLowerCase()) {
        return false;
      }
    }

    return true;
  });
};

export const calculateFilterCounts = (
  articles: ArticleSummary[] | undefined,
  query: string,
  isSynthesized: (id: string) => boolean,
) => {
  if (!articles) return { all: 0, synthesized: 0, unsynthesized: 0 };
  const normalizedQuery = query.trim().toLowerCase();

  const searchMatches = articles.filter(
    (a) =>
      !normalizedQuery ||
      a.title.toLowerCase().includes(normalizedQuery) ||
      a.subtitle.toLowerCase().includes(normalizedQuery) ||
      a.kicker.toLowerCase().includes(normalizedQuery) ||
      a.author.name.toLowerCase().includes(normalizedQuery),
  );

  const synthesized = searchMatches.filter((a) => isSynthesized(a.id)).length;
  return {
    all: searchMatches.length,
    synthesized,
    unsynthesized: searchMatches.length - synthesized,
  };
};

export const calculateTopicCounts = (
  articles: ArticleSummary[] | undefined,
  getTopic: (id: string) => string | undefined,
): Record<string, number> => {
  const counts: Record<string, number> = {};
  if (!articles) return counts;

  for (const article of articles) {
    const topic = getTopic(article.id);
    if (topic) {
      counts[topic] = (counts[topic] ?? 0) + 1;
    }
  }
  return counts;
};
