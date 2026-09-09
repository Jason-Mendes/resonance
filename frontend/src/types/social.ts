/**
 * A social carousel built from an article's own photographs.
 *
 * The backend writes text only. Pairing each caption with the image it belongs
 * to happens here, because this side already holds the article.
 */

/** One photograph already published with the article. */
export interface SocialImage {
  url: string;
  /** The caption NZZ published beneath it. Empty when it shipped without one. */
  caption: string;
}

/** What the backend returns: text, in the order the photographs were sent. */
export interface SocialCarousel {
  intro: string;
  slides: { caption: string }[];
  hashtags: string[];
}

/** A slide once its caption has been put back together with its photograph. */
export interface SocialSlideWithImage {
  caption: string;
  image: SocialImage;
}
