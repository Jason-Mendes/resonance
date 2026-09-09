/**
 * Reads a single article from the backend, server-side.
 *
 * Replaces the old local-filesystem loader. The generation routes take an
 * article id and re-read the article here rather than accepting text from the
 * browser, so a client cannot substitute its own content into a paid model
 * call. That guarantee is why this exists as a helper instead of each route
 * fetching for itself.
 */
import { BackendError, getFromBackend } from "@/lib/backend";
import { Article } from "@/types/article";

/** Null when no article carries that id. Anything else is a real failure. */
export async function fetchArticle(id: string): Promise<Article | null> {
  try {
    return await getFromBackend<Article>(`/api/articles/${encodeURIComponent(id)}`);
  } catch (error) {
    if (error instanceof BackendError && error.status === 404) {
      return null;
    }
    throw error;
  }
}
