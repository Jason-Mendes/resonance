import { useCallback, useEffect, useState } from "react";

import { useUpdateArticle } from "@/hooks/useArticlesQuery";
import { articleToDraft, describeEditLosses } from "@/lib/article-draft";
import { Article, ArticleDraft } from "@/types/article";

/**
 * Form state for editing a stored article.
 *
 * Kept apart from `useArticleInput` because the two have opposite lifecycles.
 * Adding starts empty and clears on success, ready for the next article.
 * Editing starts from what is stored and must hold the editor's text after a
 * save, since they are still looking at the article they just changed.
 */
export const useArticleEdit = (article: Article, onArticleSaved: (article: Article) => void) => {
  const [draft, setDraft] = useState<ArticleDraft>(() => articleToDraft(article));
  const { mutate, isPending, error, reset } = useUpdateArticle();

  // The stored article changes under this form after every save, and would
  // also change if someone opened a different one. Re-seeding on identity
  // rather than on id means a save writes the server's own version back into
  // the fields, so what is on screen is what is in the database.
  useEffect(() => {
    setDraft(articleToDraft(article));
  }, [article]);

  const updateField = useCallback(
    (field: keyof ArticleDraft, value: string) => {
      setDraft((prev) => ({ ...prev, [field]: value }));
      // Clearing the last failure as soon as someone edits keeps a stale
      // message from sitting under a field they have already corrected.
      reset();
    },
    [reset],
  );

  const submit = useCallback(() => {
    mutate({ id: article.id, draft }, { onSuccess: onArticleSaved });
  }, [article.id, draft, mutate, onArticleSaved]);

  return {
    draft,
    updateField,
    submit,
    isSaving: isPending,
    error: error ? error.message : null,
    losses: describeEditLosses(article),
  };
};
