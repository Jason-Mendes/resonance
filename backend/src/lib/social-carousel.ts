/**
 * Narrows what the model returned into a SocialCarousel.
 *
 * `generateSocialCarousel` returns parsed JSON typed as unknown, because a
 * model can return {}, a truncated object, or a field under a name it liked
 * better. Nothing downstream may assume the shape until this has run.
 */
import type { SocialRequest } from "./social-request.js";
import type { SocialCarousel, SocialSlide } from "../types/social.js";

/**
 * Letters and digits only, lowercased. A hashtag is the same transformation
 * applied to a name, so "Amoco Cadiz" and "amococadiz" meet here as one string.
 */
const toComparable = (value: string): string => value.toLowerCase().replace(/[^a-z0-9]/g, "");

const asStrings = (value: unknown): string[] =>
  Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];

/**
 * Slides must line up with the photographs one to one: the frontend pairs them
 * by position, so a short list would caption the wrong picture. A model that
 * returns the wrong count is a failed generation, not a partial success.
 */
function toSlides(value: unknown, expectedCount: number): SocialSlide[] | null {
  if (!Array.isArray(value) || value.length !== expectedCount) return null;

  const slides = value
    .map((slide: unknown) => (slide as { caption?: unknown })?.caption)
    .filter((caption): caption is string => typeof caption === "string" && caption.trim() !== "")
    .map((caption) => ({ caption: caption.trim() }));

  return slides.length === expectedCount ? slides : null;
}

/**
 * Keeps only hashtags whose letters appear in the article, plus the section
 * tags the article already carries. This is the guardrail: a tag the reporting
 * does not support is dropped rather than published.
 */
function groundHashtags(value: unknown, articleText: string, tags: string[]): string[] {
  const haystack = toComparable(articleText);
  const allowed = new Set(tags.map(toComparable));

  const grounded = asStrings(value)
    .map((tag) => toComparable(tag.replace(/^#+/, "")))
    .filter((tag) => tag !== "" && (allowed.has(tag) || haystack.includes(tag)));

  return Array.from(new Set(grounded));
}

/** Returns null when the model's answer cannot be trusted, which the route maps to a 502. */
export function toSocialCarousel(value: unknown, request: SocialRequest): SocialCarousel | null {
  const raw = (value ?? {}) as Record<string, unknown>;

  const slides = toSlides(raw.slides, request.imageCaptions.length);
  const intro = typeof raw.intro === "string" ? raw.intro.trim() : "";
  if (!slides || intro === "") return null;

  // Hashtags are the one field a missing value does not ruin: the post still
  // reads without them, so an empty list ships rather than failing the render.
  const hashtags = groundHashtags(raw.hashtags, request.articleText, request.tags);

  return { intro, slides, hashtags };
}
