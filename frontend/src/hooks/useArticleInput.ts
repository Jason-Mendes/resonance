import { useCallback, useState } from "react";

import { useCreateArticle } from "@/hooks/useArticlesQuery";
import { Article, ArticleDraft } from "@/types/article";

/**
 * Form state for adding an article. The draft is sent to the backend, which
 * validates it, assigns the id and builds the sections, so nothing here
 * invents any part of an article.
 */
const EMPTY_DRAFT: ArticleDraft = {
  title: "",
  body: "",
  subtitle: "",
  kicker: "",
  authorName: "",
  heroImageUrl: "",
};

export const useArticleInput = (onArticleSaved: (article: Article) => void) => {
  const [draft, setDraft] = useState<ArticleDraft>(EMPTY_DRAFT);
  const { mutate, isPending, error, reset } = useCreateArticle();

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
    mutate(draft, {
      onSuccess: (article) => {
        setDraft(EMPTY_DRAFT);
        onArticleSaved(article);
      },
    });
  }, [draft, mutate, onArticleSaved]);

  return {
    draft,
    updateField,
    submit,
    isSaving: isPending,
    error: error ? error.message : null,
  };
};
