/**
 * What an editor sets before a generation runs: the register the piece is
 * written and read in, and the words it must not use.
 *
 * Presets rather than free text, so a tone is a value the compiler knows and a
 * prompt fragment somebody wrote and tested, not whatever landed in a box.
 */
import { PublicError } from "./errors.js";

/**
 * Lowercased, with every run of punctuation and whitespace flattened to one
 * space. Letters keep their accents: NZZ writes Zürich, and folding that to
 * "zurich" would quietly stop the editor's own spelling from matching.
 */
const toWords = (value: string): string =>
  value
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .trim();

/**
 * Which of the avoided terms the text actually uses.
 *
 * Both sides are padded with a space so a term matches only as a whole word or
 * whole phrase. Without that, banning "AI" would flag the word "said".
 */
export function findForbiddenTerms(text: string, avoid: string[]): string[] {
  const haystack = ` ${toWords(text)} `;

  return avoid.filter((term) => {
    const needle = toWords(term);
    return needle !== "" && haystack.includes(` ${needle} `);
  });
}

/**
 * The registers an editor can choose from. One object and one type, imported
 * as a pair, so no route or test ever compares against a bare string.
 */
export const EDITORIAL_TONE = {
  MEASURED: "measured",
  CONVERSATIONAL: "conversational",
  URGENT: "urgent",
  EXPLANATORY: "explanatory",
} as const;

export type EditorialTone = (typeof EDITORIAL_TONE)[keyof typeof EDITORIAL_TONE];

/** What the podcast and briefing already sound like, so omitting tone changes nothing. */
export const DEFAULT_TONE: EditorialTone = EDITORIAL_TONE.MEASURED;

/**
 * What each tone means to the two models.
 *
 * `script` goes to the text model that writes the words. `delivery` replaces
 * the fixed instruction the dialogue voices are given, so one choice moves
 * both. A Record over the union, so a new tone will not compile until both
 * halves of it are written.
 */
interface TonePrompt {
  label: string;
  script: string;
  delivery: string;
}

export const TONE_PROMPTS: Record<EditorialTone, TonePrompt> = {
  [EDITORIAL_TONE.MEASURED]: {
    label: "Measured",
    script: "Keep an even, analytical register. Complete sentences, no rhetorical flourish.",
    delivery:
      "Read this as a natural two-host news podcast. Conversational and engaged, at the pace of real radio.",
  },
  [EDITORIAL_TONE.CONVERSATIONAL]: {
    label: "Conversational",
    script:
      "Keep it warm and informal. Shorter turns, more back and forth, plain words over technical ones.",
    delivery:
      "Read this as a relaxed two-host conversation. Warm and unhurried, as if the microphones were incidental.",
  },
  [EDITORIAL_TONE.URGENT]: {
    label: "Urgent",
    script:
      "Front-load what changed and why it matters now. Short turns, no throat-clearing, present tense where it reads naturally.",
    delivery: "Read this as a breaking news update. Brisk and alert, clipped without being rushed.",
  },
  [EDITORIAL_TONE.EXPLANATORY]: {
    label: "Explanatory",
    script:
      "Assume no prior knowledge. Define each term the first time it appears and build the argument one step at a time.",
    delivery:
      "Read this as a patient explainer. Unhurried, with a clear beat before each new idea.",
  },
};

/** The validated settings one generation runs with. */
export interface GenerationControls {
  tone: EditorialTone;
  /** Words, names and phrases the audio must not use. Empty is the norm. */
  avoid: string[];
}

export type ControlsResult =
  { ok: true; controls: GenerationControls } | { ok: false; error: string };

// A list longer than this is a policy document, not a note to a producer, and
// every term costs a pass over the script on every attempt.
const MAX_AVOID_TERMS = 20;

// Long enough for "the chief executive of Credit Suisse", short enough that a
// pasted paragraph is rejected rather than silently failing to match anything.
const MAX_AVOID_TERM_CHARS = 80;

/** Every tone, in declaration order. The frontend builds its picker from this. */
export const EDITORIAL_TONES: EditorialTone[] = Object.values(EDITORIAL_TONE);

export function isEditorialTone(value: unknown): value is EditorialTone {
  return EDITORIAL_TONES.some((tone) => tone === value);
}

/** Trimmed terms, or null when the caller sent something unusable. */
function parseAvoid(value: unknown): string[] | null {
  if (value === undefined) return [];
  if (!Array.isArray(value) || value.length > MAX_AVOID_TERMS) return null;

  const terms: string[] = [];
  for (const term of value) {
    // An unusable entry fails the request rather than being dropped: quietly
    // enforcing a shorter list than the editor set is the worst outcome here.
    if (typeof term !== "string" || term.length > MAX_AVOID_TERM_CHARS) return null;

    // A blank line in the editor's box is not a term, and would match nothing.
    const trimmed = term.trim();
    if (trimmed !== "") terms.push(trimmed);
  }
  return terms;
}

/**
 * Reads the controls off a request body. Both fields are optional: a caller
 * that sends neither gets the measured tone and an empty avoid list, which
 * resolve to the same instructions the prompts carry by default.
 */
export function parseGenerationControls(body: unknown): ControlsResult {
  const { tone, avoid } = (body ?? {}) as Record<string, unknown>;

  if (tone !== undefined && !isEditorialTone(tone)) {
    return { ok: false, error: `tone must be one of: ${EDITORIAL_TONES.join(", ")}` };
  }

  const terms = parseAvoid(avoid);
  if (!terms) {
    return {
      ok: false,
      error: `avoid must be at most ${MAX_AVOID_TERMS} strings of ${MAX_AVOID_TERM_CHARS} characters`,
    };
  }

  return { ok: true, controls: { tone: tone ?? DEFAULT_TONE, avoid: terms } };
}

/**
 * The controls as a block of prompt text, for the model that writes the words.
 *
 * The avoid list is stated as a rule rather than a suggestion, but the prompt
 * is only half the mechanism: what the model returns is checked with
 * `findForbiddenTerms` afterwards, because a prompt cannot be relied on.
 */
export function toScriptInstructions({ tone, avoid }: GenerationControls): string {
  const lines = [TONE_PROMPTS[tone].script];

  if (avoid.length > 0) {
    lines.push(
      `Do not use any of these words or names anywhere in the output: ${avoid.join(", ")}.`,
      "Refer to them another way, or leave the point out.",
    );
  }
  return lines.join("\n    ");
}

/** The instruction handed to the dialogue voices. Podcast only: the briefing's
 *  Cloud TTS voices take no style direction, so tone reaches it through the
 *  script alone. */
export const toDeliveryInstruction = (tone: EditorialTone): string => TONE_PROMPTS[tone].delivery;

/**
 * Thrown when the writer kept using a term the editor banned, after being
 * asked again. Carries the offending terms so the route can name them: an
 * editor told only that generation failed has no way to fix it.
 */
export class ForbiddenTermsError extends PublicError {
  constructor(readonly terms: string[]) {
    super(`The script kept using: ${terms.join(", ")}`);
    this.name = "ForbiddenTermsError";
  }
}
