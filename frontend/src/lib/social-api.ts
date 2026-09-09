import { SocialCarousel, SocialSlideWithImage } from "@/types/social";

/**
 * The carousel call this app's own route answers. Kept beside podcast-api for
 * the same reason: transport here, state in the hook.
 */
export interface SocialCarouselResult extends Omit<SocialCarousel, "slides"> {
  slides: SocialSlideWithImage[];
}

/**
 * The server's message is passed through rather than replaced. "This article
 * has no photographs" tells a reader what to do next; "request failed" does not.
 */
export const fetchSocialCarousel = async (articleId: string): Promise<SocialCarouselResult> => {
  const response = await fetch("/api/social", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ articleId }),
  });

  const payload: unknown = await response.json().catch(() => null);
  if (!response.ok) {
    const message = (payload as { error?: unknown })?.error;
    throw new Error(typeof message === "string" ? message : "Could not build the carousel");
  }

  return payload as SocialCarouselResult;
};
