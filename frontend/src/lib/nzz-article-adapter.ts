import {
  Article,
  ArticleHeroImage,
  ArticleSection,
  NzzArticleBodyItem,
  NzzRawArticle,
} from "@/types/article";

const FALLBACK_HERO_IMAGE =
  "https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=1200&auto=format&fit=crop&q=80";
const FALLBACK_READ_MINUTES = 5;
const FALLBACK_WORD_COUNT = 1200;
const SECONDS_PER_MINUTE = 60;

type BodyItemMapper = (item: NzzArticleBodyItem, id: string) => ArticleSection | null;

/**
 * One mapper per supported NZZ body item type. Returning null drops the item,
 * which is how items missing their payload (text, url) are skipped.
 */
const BODY_ITEM_MAPPERS: Record<string, BodyItemMapper> = {
  paragraph: (item, id) => (item.text ? { id, type: "paragraph", content: item.text } : null),
  heading: (item, id) => (item.text ? { id, type: "heading", content: item.text } : null),
  question: (item, id) => (item.text ? { id, type: "question", content: item.text } : null),
  answer: (item, id) => (item.text ? { id, type: "answer", content: item.text } : null),
  quote: (item, id) =>
    item.text ? { id, type: "quote", content: item.text, quoteAuthor: item.author } : null,
  image: (item, id) =>
    item.url
      ? {
          id,
          type: "image",
          content: item.caption || "",
          imageUrl: item.url,
          imageCaption: item.caption,
        }
      : null,
  infobox: (item, id) =>
    item.text || item.title
      ? { id, type: "infobox", content: item.text || item.title || "" }
      : null,
};

const mapBodyToSections = (body?: NzzArticleBodyItem[]): ArticleSection[] => {
  if (!Array.isArray(body)) return [];

  return body
    .map((item, idx) => BODY_ITEM_MAPPERS[item.type]?.(item, `sec-${idx}`))
    .filter((section): section is ArticleSection => Boolean(section));
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

  return [...intro, ...mapBodyToSections(raw.body)];
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

const resolveHeroImage = (raw: NzzRawArticle): ArticleHeroImage => ({
  url: raw.teaser_image?.url || FALLBACK_HERO_IMAGE,
  caption: raw.teaser_image?.caption || raw.headline,
  credit: raw.teaser_image?.credit,
});

const resolveTags = (raw: NzzRawArticle): string[] => {
  // Tags containing "=" are internal tracking keys, not editorial topics.
  const tags = (raw.tags || []).filter((tag) => !tag.includes("="));
  if (raw.section) tags.push(raw.section.toLowerCase());
  return Array.from(new Set(tags));
};

export const mapNzzToArticle = (raw: NzzRawArticle): Article => ({
  id: String(raw.document_id || raw.nzz_id || Date.now()),
  title: raw.headline || "Untitled Article",
  subtitle: raw.lead || "",
  kicker: raw.section || "Dispatch",
  author: {
    name: resolveAuthorName(raw),
    role: raw.section ? `NZZ ${raw.section}` : "NZZ Correspondent",
  },
  publishedAt: raw.published_at || new Date().toISOString(),
  sourceUrl: raw.url,
  readTimeMinutes: resolveReadMinutes(raw),
  wordCount: raw.word_count || FALLBACK_WORD_COUNT,
  heroImage: resolveHeroImage(raw),
  sections: buildSections(raw),
  tags: resolveTags(raw),
  summaryBullets: raw.summary_bullets_en,
});
