/**
 * A social carousel derived from a finished article. The images are the ones
 * already published with the story, so this file describes text only: the
 * frontend holds the photographs and pairs them by position.
 */

/** One slide of the carousel. Written against the published caption of the image it sits under. */
export interface SocialSlide {
  caption: string;
}

/** What one article turns into: an opening, a caption per image, and a hashtag block. */
export interface SocialCarousel {
  /** The post's opening lines, before the first slide. */
  intro: string;
  /** One per image supplied, in the order they were supplied. */
  slides: SocialSlide[];
  /** Stored without the leading "#", which is presentation. */
  hashtags: string[];
}
