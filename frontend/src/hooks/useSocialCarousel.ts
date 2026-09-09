import { useMutation } from "@tanstack/react-query";

import { fetchSocialCarousel } from "@/lib/social-api";

/**
 * Builds a social carousel for one article, on demand.
 *
 * A mutation rather than a query: it spends a Gemini call, so it must run when
 * an editor asks for it and never because a component mounted or refocused.
 */
export const useSocialCarousel = (articleId: string) => {
  const { mutate, data, isPending, error, reset } = useMutation({
    mutationFn: () => fetchSocialCarousel(articleId),
  });

  return {
    carousel: data ?? null,
    generate: mutate,
    isGenerating: isPending,
    error: error ? error.message : null,
    reset,
  };
};
