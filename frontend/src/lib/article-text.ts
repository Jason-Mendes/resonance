import { Article, ArticleSection } from "@/types/article";

/**
 * Flattens an Article into the single string the backend's `articleText`
 * contract expects. What this includes is what the model reads, and therefore
 * what a listener hears, so section types the reader shows but a narrator
 * cannot speak are dropped rather than passed through.
 */

// Image sections carry a caption, not reporting. A narrator reading photo
// credits aloud is the failure this excludes.
const SPOKEN_SECTION_TYPES = new Set<ArticleSection["type"]>([
  "lead",
  "paragraph",
  "heading",
  "quote",
  "question",
  "answer",
  "key-points",
  "data-callout",
  "infobox",
]);

const renderSection = (section: ArticleSection): string | null => {
  if (!SPOKEN_SECTION_TYPES.has(section.type)) return null;

  // Bullet lists live in `items`, not `content`, so a key-points section
  // serialised from `content` alone would lose every point it holds.
  const body = section.items?.length
    ? [section.content, ...section.items.map((item) => `- ${item}`)].join("\n")
    : section.content;

  const trimmed = body.trim();
  return trimmed.length > 0 ? trimmed : null;
};

/**
 * The headline and standfirst lead, because the model is asked to open on what
 * the story is about and the body alone rarely states it outright.
 */
export const articleToText = (article: Article): string => {
  const spoken = article.sections
    .map(renderSection)
    .filter((section): section is string => section !== null);

  return [article.title, article.subtitle, ...spoken]
    .map((part) => part.trim())
    .filter(Boolean)
    .join("\n\n");
};
