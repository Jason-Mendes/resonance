import { GoogleGenAI } from '@google/genai';
import * as dotenv from 'dotenv';

dotenv.config();

// Fail at startup rather than on the first request. Without this the server
// boots healthy and every article request returns an opaque auth error.
const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  throw new Error(
    'GEMINI_API_KEY is not set. Add it to backend/.env or the deployment environment.',
  );
}

// Initialize the Gemini client
export const genAI = new GoogleGenAI({ apiKey });

// The model we want to use for heavy text reasoning
const TEXT_MODEL = 'gemini-2.5-flash'; 

/**
 * Extracts the article content and layers it according to the FlexRead challenge.
 */
export async function generateFlexReadLayers(articleText: string) {
  const prompt = `
    You are a highly skilled editor for NZZ (Neue Zürcher Zeitung). 
    Your task is to take the following raw article text and create a multi-layered reading experience.
    
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

  const response = await genAI.models.generateContent({
    model: TEXT_MODEL,
    contents: prompt,
    config: {
      responseMimeType: 'application/json',
    },
  });

  return JSON.parse(response.text || '{}');
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
    - No stage directions, no "[laughs]", no speaker names inside the text.
    
    Return the response as a valid JSON array of objects, where each object has:
    {
      "speaker": "HostA" or "HostB",
      "text": "The line of dialogue to be spoken."
    }
    
    Article Text:
    ---
    ${articleText}
  `;

  const response = await genAI.models.generateContent({
    model: TEXT_MODEL,
    contents: prompt,
    config: {
      responseMimeType: 'application/json',
    },
  });

  return JSON.parse(response.text || '[]');
}
