/**
 * The raw shape of an NZZ export file, as read by the seed script.
 *
 * Only the seed script sees this. Once an article is in Firestore it is stored
 * in the Article shape, so nothing on the request path parses NZZ JSON.
 */

export interface NzzArticleImage {
  url: string;
  caption?: string;
  credit?: string;
}

export interface NzzArticleBodyItem {
  type: string;
  text?: string;
  url?: string;
  caption?: string;
  author?: string;
  title?: string;
  items?: string[];
  /** Present on gallery items, which carry several images rather than one. */
  images?: NzzArticleImage[];
}

export interface NzzRawArticle {
  document_id: number | string;
  nzz_id?: string;
  url?: string;
  section?: string;
  published_at: string;
  headline: string;
  lead?: string;
  author_line?: string;
  authors?: string[];
  reading_time_seconds?: number;
  word_count?: number;
  summary_bullets_en?: string[];
  tags?: string[];
  teaser_image?: NzzArticleImage;
  body?: NzzArticleBodyItem[];
}
