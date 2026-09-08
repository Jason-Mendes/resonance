/**
 * Shared validation for every route that forwards article text to a model.
 * Each of those calls costs money, so the checks live in one place rather than
 * being copied per route and drifting.
 */

// Long-read articles run to roughly 20k characters. This caps what one request
// can push into a paid model call.
export const MAX_ARTICLE_CHARS = 50_000;

export type ArticleTextResult = { ok: true; articleText: string } | { ok: false; error: string };

export function parseArticleText(body: unknown): ArticleTextResult {
  if (typeof body !== "object" || body === null) {
    return { ok: false, error: "request body must be a JSON object" };
  }

  const { articleText } = body as { articleText?: unknown };

  // Reject non-strings explicitly: a falsy check alone lets objects, arrays
  // and numbers through to the model call.
  if (typeof articleText !== "string" || articleText.trim().length === 0) {
    return { ok: false, error: "articleText must be a non-empty string" };
  }

  if (articleText.length > MAX_ARTICLE_CHARS) {
    return {
      ok: false,
      error: `articleText must be at most ${MAX_ARTICLE_CHARS} characters`,
    };
  }

  return { ok: true, articleText };
}
