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
  heroImage: ArticleHeroImage;
  sections: ArticleSection[];
  tags: string[];
  summaryBullets?: string[];
}

export type ArticleInputMode = "url" | "text";

export interface NzzArticleImage {
  url: string;
  caption?: string;
  credit?: string;
  width?: number;
  height?: number;
}

export interface NzzArticleBodyItem {
  type: string;
  text?: string;
  url?: string;
  caption?: string;
  credit?: string;
  width?: number;
  height?: number;
  author?: string;
  title?: string;
  items?: string[];
}

export interface NzzRawArticle {
  document_id: number | string;
  nzz_id?: string;
  url?: string;
  language?: string;
  section?: string;
  ressort_path?: string;
  published_at: string;
  last_updated?: string;
  headline: string;
  lead?: string;
  author_line?: string;
  authors?: string[];
  reading_time_seconds?: number;
  word_count?: number;
  character_count?: number;
  seo_title?: string;
  social_title?: string;
  summary_bullets_en?: string[];
  tags?: string[];
  teaser_image?: NzzArticleImage;
  body?: NzzArticleBodyItem[];
  body_text?: string;
}
