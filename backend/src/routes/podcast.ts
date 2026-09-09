import { Router } from "express";

import { parseArticleText } from "../lib/articleText.js";
import { ForbiddenTermsError, parseGenerationControls } from "../lib/generation-controls.js";
import { generatePodcastScript } from "../services/gemini.js";

export const podcastRouter = Router();

podcastRouter.post("/", async (req, res) => {
  const parsed = parseArticleText(req.body);
  if (!parsed.ok) {
    return res.status(400).json({ error: parsed.error });
  }

  const controls = parseGenerationControls(req.body);
  if (!controls.ok) {
    return res.status(400).json({ error: controls.error });
  }

  try {
    const script = await generatePodcastScript(parsed.articleText, controls.controls);
    res.json({ script });
  } catch (error) {
    // 422, not 400: the request was fine and the model would not comply. The
    // terms ship as a list so the editor's own chips can be marked, and they
    // are the caller's own words, so echoing them leaks nothing.
    if (error instanceof ForbiddenTermsError) {
      return res.status(422).json({ error: error.message, terms: error.terms });
    }
    // Detail stays server-side. Gemini SDK errors can name models and quota
    // state, none of which belongs in a response to an anonymous caller.
    console.error("Podcast API Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
