import { useQuery } from "@tanstack/react-query";

import { QUERY_KEYS } from "@/lib/query-keys";
import { Article } from "@/types/article";

export interface ArticleSummary {
  id: string;
  kicker: string;
  title: string;
  subtitle: string;
  author: {
    name: string;
    role: string;
    avatarUrl?: string;
  };
  publishedAt: string;
  readTimeMinutes: number;
  wordCount: number;
  heroImage: {
    url: string;
    caption?: string;
    credit?: string;
  };
  tags: string[];
}

export const fetchArticlesList = async (): Promise<ArticleSummary[]> => {
  const res = await fetch("/api/articles");
  if (!res.ok) throw new Error("Failed to fetch articles");
  return res.json();
};

export const fetchArticleById = async (id: string): Promise<Article> => {
  const res = await fetch(`/api/articles/${id}`);
  if (!res.ok) throw new Error(`Failed to fetch article ${id}`);
  return res.json();
};

export const useArticlesList = () => {
  return useQuery({
    queryKey: QUERY_KEYS.articles,
    queryFn: fetchArticlesList,
  });
};

export const useArticleDetail = (articleId: string | null) => {
  return useQuery({
    queryKey: articleId ? QUERY_KEYS.article(articleId) : ["articles", "null"],
    queryFn: () => (articleId ? fetchArticleById(articleId) : Promise.reject("No ID")),
    enabled: Boolean(articleId),
  });
};
