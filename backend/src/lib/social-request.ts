/**
 * Validation for the social carousel route. Composes `parseArticleText` rather
 * than repeating it, so the article-length cap that protects the paid model
 * call is enforced in exactly one place.
 */
import { parseArticleText } from "./articleText.js";

/** A carousel nobody will swipe past, and the point where a model call stops being worth it. */
export const MAX_SLIDES = 10;

/** Published NZZ captions are a sentence or two. This rejects a body pasted into the field. */
const MAX_CAPTION_CHARS = 500;

export interface SocialRequest {
  articleText: string;
  /** The published caption of each image, in the order the images appear. */
  imageCaptions: string[];
  /** Section tags already on the article. The model formats these, it does not invent them. */
  tags: string[];
}

export type SocialRequestResult =
  { ok: true; request: SocialRequest } | { ok: false; error: string };

/** Captions arrive from the article record, so a bad one is a bug here, not a hostile caller. */
function parseImageCaptions(value: unknown): string[] | null {
  if (!Array.isArray(value) || value.length === 0 || value.length > MAX_SLIDES) return null;

  // An image published without a caption is normal, so "" is allowed through
  // and the prompt is told to lean on the article for that slide instead.
  const captions = value.filter(
    (caption): caption is string =>
      typeof caption === "string" && caption.length <= MAX_CAPTION_CHARS,
  );

  return captions.length === value.length ? captions : null;
}

export function parseSocialRequest(body: unknown): SocialRequestResult {
  const parsedText = parseArticleText(body);
  if (!parsedText.ok) return parsedText;

  const { imageCaptions, tags } = (body ?? {}) as Record<string, unknown>;

  const captions = parseImageCaptions(imageCaptions);
  if (!captions) {
    return { ok: false, error: `imageCaptions must be 1 to ${MAX_SLIDES} strings` };
  }

  // Tags are optional: an editor-written article has none until someone files it.
  const sectionTags = Array.isArray(tags) ? tags.filter((tag) => typeof tag === "string") : [];

  return {
    ok: true,
    request: { articleText: parsedText.articleText, imageCaptions: captions, tags: sectionTags },
  };
}
