import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { QUERY_KEYS } from "@/lib/query-keys";
import { Article, ArticleDraft, ArticleSummary } from "@/types/article";

export type { ArticleSummary };

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

/**
 * Saves an article an editor typed in. On success the list is invalidated so
 * the new article appears without a reload.
 */
export const useCreateArticle = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (draft: ArticleDraft): Promise<Article> => {
      const res = await fetch("/api/articles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(draft),
      });

      const data: unknown = await res.json();
      if (!res.ok) {
        // The backend writes these messages, and they name the field that
        // was wrong, so showing them beats a generic failure notice.
        const message = (data as { error?: unknown })?.error;
        throw new Error(typeof message === "string" ? message : "Could not save the article");
      }
      return data as Article;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEYS.articles }),
  });
};

export const useArticleDetail = (articleId: string | null) => {
  return useQuery({
    queryKey: articleId ? QUERY_KEYS.article(articleId) : ["articles", "null"],
    queryFn: () => (articleId ? fetchArticleById(articleId) : Promise.reject("No ID")),
    enabled: Boolean(articleId),
  });
};
