import { GoogleGenAI } from "@google/genai";
import * as dotenv from "dotenv";

dotenv.config();

// Fail at startup rather than on the first request. Without this the server
// boots healthy and every article request returns an opaque auth error.
const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  throw new Error(
    "GEMINI_API_KEY is not set. Add it to backend/.env or the deployment environment.",
  );
}

// Initialize the Gemini client
export const genAI = new GoogleGenAI({ apiKey });

// The model we want to use for heavy text reasoning
const TEXT_MODEL = "gemini-2.5-flash";

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
    Act as a professional podcast producer. Based on the provided article, write a 3-4 minute, natural, conversational dialogue between two hosts: 
    - "HostA": Analytical, expert, provides context.
    - "HostB": Curious, casual, asks the right questions.
    
    Make it sound like a real discussion, with banter and smooth transitions. No rigid jargon.
    
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
      responseMimeType: "application/json",
    },
  });

  return JSON.parse(response.text || "[]");
}
