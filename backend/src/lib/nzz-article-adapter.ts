/**
 * Turns a raw NZZ export into the Article shape the app serves.
 *
 * Runs once per article at seed time, never on a request. Unrecognised body
 * items are skipped rather than failing the article, because the export
 * contains block types this app has no way to render.
 */
import type {
  Article,
  ArticleHeroImage,
  ArticleSection,
  ArticleSectionType,
} from "../types/article.js";
import type { NzzArticleBodyItem, NzzRawArticle } from "../types/nzz.js";

const FALLBACK_READ_MINUTES = 5;
const FALLBACK_WORD_COUNT = 1200;
const SECONDS_PER_MINUTE = 60;

/**
 * One mapper per body type this app can render. An empty array drops the item,
 * which is how both unrenderable blocks and items missing their payload are
 * skipped. A gallery returns several sections from a single item.
 */
type BodyItemMapper = (item: NzzArticleBodyItem, id: string) => ArticleSection[];

/** Builds a mapper for the block types that are text and nothing else. */
const textSection =
  (type: ArticleSectionType): BodyItemMapper =>
  (item, id) =>
    item.text ? [{ id, type, content: item.text }] : [];

/**
 * A lone image and each photo inside a gallery become the same section, so
 * both mappers build it here. The caption key is omitted rather than set to
 * undefined, which is what exactOptionalPropertyTypes requires.
 */
const imageSection = (id: string, url: string, caption: string | undefined): ArticleSection => ({
  id,
  type: "image",
  content: caption ?? "",
  imageUrl: url,
  ...(caption ? { imageCaption: caption } : {}),
});

const BODY_ITEM_MAPPERS: Record<string, BodyItemMapper> = {
  paragraph: textSection("paragraph"),
  heading: textSection("heading"),
  question: textSection("question"),
  answer: textSection("answer"),
  // A written summary block and a sponsor disclosure. Neither has a section
  // type of its own, and an infobox is what both look like on the page.
  "html-box": textSection("infobox"),
  footnote: textSection("infobox"),
  infobox: (item, id) => {
    const content = item.text ?? item.title;
    return content ? [{ id, type: "infobox", content }] : [];
  },
  quote: (item, id) =>
    item.text
      ? [
          {
            id,
            type: "quote",
            content: item.text,
            ...(item.author ? { quoteAuthor: item.author } : {}),
          },
        ]
      : [],
  image: (item, id) => (item.url ? [imageSection(id, item.url, item.caption)] : []),
  // One gallery becomes one image section per photo. The renderer has no
  // gallery type, and NZZ galleries are picture sequences rather than
  // carousels, so consecutive images read the same way.
  gallery: (item, id) =>
    (item.images ?? [])
      .filter((image) => image.url)
      .map((image, index) => imageSection(`${id}-${index}`, image.url, image.caption)),
};

const buildSections = (raw: NzzRawArticle): ArticleSection[] => {
  const intro: ArticleSection[] = [];

  if (raw.lead) {
    intro.push({ id: "sec-lead", type: "lead", content: raw.lead });
  }

  if (raw.summary_bullets_en?.length) {
    intro.push({
      id: "sec-bullets",
      type: "key-points",
      content: "Key Takeaways",
      items: raw.summary_bullets_en,
    });
  }

  const body = (raw.body ?? []).flatMap(
    (item, index) => BODY_ITEM_MAPPERS[item.type]?.(item, `sec-${index}`) ?? [],
  );

  return [...intro, ...body];
};

const resolveAuthorName = (raw: NzzRawArticle): string => {
  if (raw.author_line) return raw.author_line;
  if (raw.authors?.length) return raw.authors.join(", ");
  return "NZZ Editorial";
};

const resolveReadMinutes = (raw: NzzRawArticle): number =>
  raw.reading_time_seconds
    ? Math.max(1, Math.round(raw.reading_time_seconds / SECONDS_PER_MINUTE))
    : FALLBACK_READ_MINUTES;

/**
 * Throws rather than substituting a stock photo. Every article in the export
 * has a teaser image, so a missing one means the data changed and we would
 * rather find out at seed time than publish someone else's picture as NZZ's.
 */
const resolveHeroImage = (raw: NzzRawArticle): ArticleHeroImage => {
  const url = raw.teaser_image?.url;
  if (!url) {
    throw new Error(`Article ${String(raw.document_id)} has no teaser image`);
  }

  return {
    url,
    caption: raw.teaser_image?.caption ?? raw.headline,
    ...(raw.teaser_image?.credit ? { credit: raw.teaser_image.credit } : {}),
  };
};

const resolveTags = (raw: NzzRawArticle): string[] => {
  // Tags containing "=" are internal tracking keys, not editorial topics.
  const tags = (raw.tags ?? []).filter((tag) => !tag.includes("="));
  if (raw.section) tags.push(raw.section.toLowerCase());
  return Array.from(new Set(tags));
};

/** Throws if the export is missing something an article cannot be built without. */
export const mapNzzToArticle = (raw: NzzRawArticle): Article => ({
  id: String(raw.document_id),
  title: raw.headline,
  subtitle: raw.lead ?? "",
  kicker: raw.section ?? "Dispatch",
  author: {
    name: resolveAuthorName(raw),
    role: raw.section ? `NZZ ${raw.section}` : "NZZ Correspondent",
  },
  publishedAt: raw.published_at,
  readTimeMinutes: resolveReadMinutes(raw),
  wordCount: raw.word_count ?? FALLBACK_WORD_COUNT,
  heroImage: resolveHeroImage(raw),
  sections: buildSections(raw),
  tags: resolveTags(raw),
  ...(raw.url ? { sourceUrl: raw.url } : {}),
  ...(raw.summary_bullets_en?.length ? { summaryBullets: raw.summary_bullets_en } : {}),
});
