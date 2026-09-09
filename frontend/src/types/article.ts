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

export interface ArticleDataMetric {
  label: string;
  value: string;
  change?: string;
  context?: string;
}

export interface ArticleSection {
  id: string;
  type: ArticleSectionType;
  content: string;
  items?: string[];
  quoteAuthor?: string;
  quoteRole?: string;
  imageUrl?: string;
  imageCaption?: string;
  dataMetric?: ArticleDataMetric;
}

export interface ArticleAuthor {
  name: string;
  role: string;
  avatarUrl?: string;
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
  /** Absent on articles an editor added without one. */
  heroImage?: ArticleHeroImage;
  sections: ArticleSection[];
  tags: string[];
  summaryBullets?: string[];
}

/** What the article list returns: everything except the body. */
export type ArticleSummary = Omit<Article, "sections" | "summaryBullets" | "sourceUrl">;

/** The fields the editor form collects. The backend builds the article. */
export interface ArticleDraft {
  title: string;
  body: string;
  subtitle?: string;
  kicker?: string;
  authorName?: string;
  heroImageUrl?: string;
}

export type ArticleInputMode = "url" | "text";
