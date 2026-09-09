/**
 * Validates what an editor typed and turns it into an Article.
 *
 * The browser sends the raw fields, never a finished article, so ids, dates
 * and section structure are decided here. A client that could post a complete
 * article could post any id and overwrite an NZZ one.
 */
import { MAX_ARTICLE_CHARS } from "./articleText.js";

import type { Article, ArticleSection } from "../types/article.js";

const MAX_SHORT_FIELD_CHARS = 300;
const WORDS_PER_MINUTE = 200;

/**
 * Splits the body on blank lines. The first block is the standfirst, a block
 * starting with # is a heading and one starting with > is a pulled quote.
 * Everything else is a paragraph.
 */
const toSections = (body: string): ArticleSection[] =>
  body
    .split(/\n\n+/)
    .map((block) => block.trim())
    .filter(Boolean)
    .map((block, index) => {
      const id = `sec-${index}`;
      if (index === 0) return { id, type: "lead" as const, content: block };
      if (block.startsWith("#")) {
        return { id, type: "heading" as const, content: block.replace(/^#+\s*/, "") };
      }
      if (block.startsWith(">")) {
        return { id, type: "quote" as const, content: block.replace(/^>\s*/, "") };
      }
      return { id, type: "paragraph" as const, content: block };
    });

/** What the editor form collects. Only a headline and a body are required. */
export interface ArticleDraft {
  title: string;
  body: string;
  subtitle?: string;
  kicker?: string;
  authorName?: string;
  heroImageUrl?: string;
}

export type DraftResult = { ok: true; draft: ArticleDraft } | { ok: false; error: string };

/** Trims a value that should be a short string, or null if it is not one. */
function shortField(value: unknown): string | null {
  if (value === undefined || value === null) return "";
  if (typeof value !== "string" || value.length > MAX_SHORT_FIELD_CHARS) return null;
  return value.trim();
}

export function parseArticleDraft(body: unknown): DraftResult {
  if (typeof body !== "object" || body === null) {
    return { ok: false, error: "request body must be a JSON object" };
  }

  const input = body as Record<string, unknown>;

  const title = shortField(input.title);
  if (!title) {
    return {
      ok: false,
      error: `title must be a non-empty string of at most ${MAX_SHORT_FIELD_CHARS} characters`,
    };
  }

  const text = input.body;
  if (typeof text !== "string" || text.trim().length === 0) {
    return { ok: false, error: "body must be a non-empty string" };
  }
  if (text.length > MAX_ARTICLE_CHARS) {
    return { ok: false, error: `body must be at most ${MAX_ARTICLE_CHARS} characters` };
  }

  const optional = { subtitle: input.subtitle, kicker: input.kicker, authorName: input.authorName };
  const trimmed: Record<string, string> = {};
  for (const [field, value] of Object.entries(optional)) {
    const parsed = shortField(value);
    if (parsed === null) {
      return {
        ok: false,
        error: `${field} must be a string of at most ${MAX_SHORT_FIELD_CHARS} characters`,
      };
    }
    if (parsed) trimmed[field] = parsed;
  }

  const heroImage = parseHeroImageUrl(input.heroImageUrl);
  if (heroImage === null) {
    return { ok: false, error: "heroImageUrl must be an https:// URL" };
  }

  return {
    ok: true,
    draft: { title, body: text, ...trimmed, ...(heroImage ? { heroImageUrl: heroImage } : {}) },
  };
}

/**
 * Builds the stored article. The id and the publication date are arguments
 * rather than fields, because both are the server's to decide: a caller that
 * chose its own id could overwrite an NZZ article.
 */
export function draftToArticle(draft: ArticleDraft, id: string): Article {
  const wordCount = draft.body.trim().split(/\s+/).length;

  return {
    id,
    title: draft.title,
    subtitle: draft.subtitle ?? "",
    kicker: draft.kicker ?? "Editorial",
    author: { name: draft.authorName ?? "NZZ Editorial", role: "Editorial Contributor" },
    publishedAt: new Date().toISOString(),
    readTimeMinutes: Math.max(1, Math.ceil(wordCount / WORDS_PER_MINUTE)),
    wordCount,
    sections: toSections(draft.body),
    tags: [],
    ...(draft.heroImageUrl ? { heroImage: { url: draft.heroImageUrl, caption: draft.title } } : {}),
  };
}

/**
 * Empty string when absent, null when unusable. Only https is accepted: this
 * URL becomes an <img src> on the page, so http would mean a mixed-content
 * image that browsers block anyway, and other schemes have no business there.
 */
function parseHeroImageUrl(value: unknown): string | null {
  if (value === undefined || value === null || value === "") return "";
  if (typeof value !== "string" || value.length > MAX_SHORT_FIELD_CHARS) return null;

  try {
    return new URL(value).protocol === "https:" ? value.trim() : null;
  } catch {
    // URL throws on anything it cannot parse, which is the answer we want.
    return null;
  }
}
