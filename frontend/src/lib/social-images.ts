import { Article } from "@/types/article";
import { SocialImage } from "@/types/social";

/**
 * The photographs already published with an article, in reading order: the
 * hero first, then every image section as it appears in the body.
 *
 * Nothing is generated or fetched. A carousel shows the pictures the story
 * shipped with, which is what makes it safe to publish unreviewed.
 */

/** Beyond this a carousel stops being swipeable, and it is the backend's cap too. */
export const MAX_CAROUSEL_IMAGES = 10;

export const collectSocialImages = (article: Article): SocialImage[] => {
  const hero: SocialImage[] = article.heroImage?.url
    ? [{ url: article.heroImage.url, caption: article.heroImage.caption }]
    : [];

  const fromBody = article.sections
    .filter((section) => section.type === "image" && section.imageUrl)
    // imageCaption is the photographer's caption; content repeats it or is
    // empty, so the caption field is the only one worth sending.
    .map((section) => ({ url: section.imageUrl as string, caption: section.imageCaption ?? "" }));

  return [...hero, ...fromBody].slice(0, MAX_CAROUSEL_IMAGES);
};
