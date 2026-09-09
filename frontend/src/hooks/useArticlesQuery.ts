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

/** One request for both saves. Creating posts to the collection, editing puts
 *  to the article's own URL, and the failure handling is identical either way. */
const saveArticle = async (
  method: "POST" | "PUT",
  url: string,
  draft: ArticleDraft,
): Promise<Article> => {
  const res = await fetch(url, {
    method,
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
};

/**
 * Saves an article an editor typed in. On success the list is invalidated so
 * the new article appears without a reload.
 */
export const useCreateArticle = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (draft: ArticleDraft) => saveArticle("POST", "/api/articles", draft),
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

export interface ArticleEdit {
  id: string;
  draft: ArticleDraft;
}

/**
 * Saves an edit to a stored article.
 *
 * The response is the article as the server actually wrote it, sections and
 * all, so it is written straight into the detail cache rather than refetched.
 * That new object is also what makes a regeneration honest: the studio clears
 * a podcast built from the old text as soon as the article behind it changes.
 */
export const useUpdateArticle = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, draft }: ArticleEdit) =>
      saveArticle("PUT", `/api/articles/${encodeURIComponent(id)}`, draft),
    onSuccess: (article) => {
      queryClient.setQueryData(QUERY_KEYS.article(article.id), article);
      // exact, so this refreshes the card grid without also discarding the
      // detail entry set on the line above and fetching it a second time.
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.articles, exact: true });
    },
  });
};
