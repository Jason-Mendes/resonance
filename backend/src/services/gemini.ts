import * as dotenv from "dotenv";

import { getVertexClient } from "../lib/vertex.js";

import type { SocialRequest } from "../lib/social-request.js";

dotenv.config();

// The model we want to use for heavy text reasoning
const TEXT_MODEL = "gemini-2.5-flash";

/**
 * Extracts the article content and layers it according to the FlexRead challenge.
 */
export async function generateFlexReadLayers(articleText: string) {
  const prompt = `
    You are a highly skilled editor for NZZ (Neue Zürcher Zeitung).
    Your task is to take the following raw article text and create a multi-layered reading experience.

    Write every field in the same language as the article itself. Naming NZZ
    otherwise leads to German output for an English article, which the English
    narration voice then reads aloud.

    Return the response as a valid JSON object with the following structure:
    {
      "headline": "A strong, factual NZZ-style headline",
      "summary60s": "A comprehensive summary that takes exactly 60 seconds to read (approx 130-150 words).",
      "keyPoints": ["Point 1", "Point 2", "Point 3", "Point 4", "Point 5"]
    }
    
    Article Text:
    ---
    ${articleText}
  `;

  const response = await getVertexClient().models.generateContent({
    model: TEXT_MODEL,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
    },
  });

  return JSON.parse(response.text || "{}");
}

/**
 * Generates a two-host podcast script discussing the article.
 */
export async function generatePodcastScript(articleText: string) {
  const prompt = `
    Act as a professional podcast producer. Based on the provided article, write a 3-4 minute dialogue between two hosts:
    - "HostA": Analytical, expert, provides context.
    - "HostB": Curious, casual, asks the right questions.

    This is read aloud by a broadcast text-to-speech voice, which delivers
    prepared copy well and cannot act. Write measured, complete sentences, the
    way a documentary narrator or a radio feature is written.

    - Every turn is a complete thought in full sentences. No fragments.
    - No one-word or two-word reactions. A voice cannot deliver "Wait, really?"
      convincingly, and a flat exclamation sounds worse than a flat statement.
    - No interruptions or trailing off. The voice has no prosody to sell them.
    - Use contractions where they read naturally: "it's", "that's", "they're".
    - No bullet points, headings, lists or markdown. Nobody speaks a bullet point.
    - Spell out numbers and symbols as a person would say them: "about forty per cent", not "~40%".
    - No stage directions and no "[laughs]".
    - The hosts never address each other by name. "HostA" and "HostB" are
      labels for the JSON field only, never words a host says out loud.
      "That's a great question, HostA" is wrong: the voice reads the label
      aloud. Write "That's a great question" instead.
    
    Return the response as a valid JSON array of objects, where each object has:
    {
      "speaker": "HostA" or "HostB",
      "text": "The line of dialogue to be spoken."
    }
    
    Article Text:
    ---
    ${articleText}
  `;

  const response = await getVertexClient().models.generateContent({
    model: TEXT_MODEL,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
    },
  });

  return JSON.parse(response.text || "[]");
}

/**
 * Turns a finished article into a social carousel: an opening, one caption per
 * published photograph, and a hashtag block.
 *
 * The model never sees an image, only the caption NZZ published beneath it.
 * That keeps every slide grounded in the real photograph without handing a
 * language model a picture it would otherwise describe from imagination.
 */
export async function generateSocialCarousel({
  articleText,
  imageCaptions,
  tags,
}: SocialRequest): Promise<unknown> {
  const slideBriefs = imageCaptions
    .map((caption, index) => `Slide ${index + 1}: ${caption || "(published without a caption)"}`)
    .join("\n");

  const prompt = `
    You are the social editor at NZZ (Neue Zürcher Zeitung). Turn the article
    below into one carousel post for Instagram and LinkedIn.

    Write every field in the same language as the article itself.

    NZZ voice: intellectual restraint, precise nouns, no hype. Never open with
    a rhetorical question. No emoji. No exclamation marks. No "Thread 🧵",
    "Let that sink in", or any engagement-bait phrasing.

    Hashtags: return 5 to 8, lowercase, without the "#". Each one must name a
    subject the article actually covers: a place, an institution, a person, a
    field. Nothing invented, no slogans, no campaign names, no "breaking".
    Every hashtag is checked against the article afterwards and dropped if
    its letters do not appear there, so spell names exactly as written.
    These section tags are already on the article and must be included: ${tags.join(", ") || "none"}

    The slides array must hold exactly ${imageCaptions.length} objects, one
    per photograph below, in this order. Not fewer, not more.
    ${slideBriefs}

    Each slide caption is one or two sentences and must be supported by the
    article. Where a photograph has no caption, write from the article instead
    of describing what the picture might show.

    Return a valid JSON object with this structure:
    {
      "intro": "Two or three sentences opening the post, stating what the story found.",
      "slides": [{ "caption": "Caption for slide 1" }],
      "hashtags": ["lowercase", "without", "hashes"]
    }

    Article Text:
    ---
    ${articleText}
  `;

  const response = await getVertexClient().models.generateContent({
    model: TEXT_MODEL,
    contents: prompt,
    config: { responseMimeType: "application/json" },
  });

  return JSON.parse(response.text || "{}");
}
