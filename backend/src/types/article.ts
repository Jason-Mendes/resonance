/**
 * The article shape this service stores and serves.
 *
 * This is the contract with the frontend, which holds its own definition. The
 * two are separate deployables with no shared package, so the duplication is
 * deliberate: changing a field here means changing it there too.
 *
 * The frontend's version carries three extra optional fields — quoteRole,
 * dataMetric and avatarUrl — that no NZZ article can produce. They are absent
 * here so this type describes only what the service can actually return.
 */

export type ArticleSectionType =
  | "lead"
  | "paragraph"
  | "heading"
  | "quote"
  | "image"
  | "key-points"
  | "data-callout"
  | "question"
  | "answer"
  | "infobox";

export interface ArticleSection {
  id: string;
  type: ArticleSectionType;
  content: string;
  items?: string[];
  quoteAuthor?: string;
  imageUrl?: string;
  imageCaption?: string;
}

export interface ArticleAuthor {
  name: string;
  role: string;
}

export interface ArticleHeroImage {
  url: string;
  caption: string;
  credit?: string;
}

export interface Article {
  id: string;
  title: string;
  subtitle: string;
  kicker: string;
  author: ArticleAuthor;
  publishedAt: string;
  sourceUrl?: string;
  readTimeMinutes: number;
  wordCount: number;
  heroImage: ArticleHeroImage;
  sections: ArticleSection[];
  tags: string[];
  summaryBullets?: string[];
}

/** The subset sent for the article list, where bodies would be wasted bytes. */
export type ArticleSummary = Omit<Article, "sections" | "summaryBullets" | "sourceUrl">;
