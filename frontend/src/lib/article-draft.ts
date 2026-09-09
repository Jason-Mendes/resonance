import { Article, ArticleDraft, ArticleSection } from "@/types/article";

/**
 * Turns a stored article back into the draft the editor form edits.
 *
 * The inverse of the backend's `toSections`, so what an editor sees in the
 * textarea is what the parser will rebuild from it. Anything the plain-text
 * body cannot express is reported by `describeEditLosses` rather than being
 * dropped without a word.
 */

/** The section types a plain-text body can round-trip without changing. */
const LOSSLESS_TYPES = new Set<ArticleSection["type"]>(["lead", "paragraph", "heading", "quote"]);

/**
 * One section as the block of text that reparses into it. Types outside
 * LOSSLESS_TYPES keep their words and lose their styling: an infobox comes
 * back as a paragraph, which beats losing the sentences it held.
 */
const sectionToBlock = (section: ArticleSection): string | null => {
  if (section.type === "heading") return `## ${section.content}`;
  if (section.type === "quote") return `> ${section.content}`;
  // A key-points section keeps its points in `items`, so serialising `content`
  // alone would hand the editor a heading with nothing under it.
  if (section.items?.length) return [section.content, ...section.items].join("\n");

  return section.content.trim() || null;
};

/** Prefills the edit form. Empty optional fields stay empty strings so the
 *  inputs stay controlled rather than flipping to uncontrolled on first keypress. */
export const articleToDraft = (article: Article): ArticleDraft => ({
  title: article.title,
  subtitle: article.subtitle,
  kicker: article.kicker,
  authorName: article.author.name,
  heroImageUrl: article.heroImage?.url ?? "",
  body: article.sections
    .map(sectionToBlock)
    .filter((block): block is string => block !== null)
    .join("\n\n"),
});

/**
 * What saving this article as plain text will destroy, or null when nothing.
 *
 * The 29 NZZ articles carry photographs, infoboxes and interview turns that
 * the body textarea has no way to express, so an edit flattens them. That is
 * a deliberate trade, but an editor should meet it before they press save
 * rather than discover it afterwards on a published page.
 */
export const describeEditLosses = (article: Article): string | null => {
  const images = article.sections.filter((section) => section.type === "image").length;
  const restyled = article.sections.filter(
    (section) => section.type !== "image" && !LOSSLESS_TYPES.has(section.type),
  ).length;

  const plural = (count: number) => (count === 1 ? "" : "s");
  const losses = [
    images > 0 ? `${images} in-article image${plural(images)} will be removed` : null,
    restyled > 0
      ? `${restyled} infobox or interview section${plural(restyled)} will become plain paragraphs`
      : null,
  ].filter((loss): loss is string => loss !== null);

  return losses.length > 0
    ? `Saving rebuilds the body from this text: ${losses.join(", ")}.`
    : null;
};
