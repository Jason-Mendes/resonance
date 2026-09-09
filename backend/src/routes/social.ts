import { Router } from "express";

import { toSocialCarousel } from "../lib/social-carousel.js";
import { parseSocialRequest } from "../lib/social-request.js";
import { generateSocialCarousel } from "../services/gemini.js";

export const socialRouter = Router();

/**
 * Article in, one social carousel out: an opening, a caption per published
 * photograph, and hashtags. Answered directly rather than as a job, because a
 * single Flash call returns in seconds and no audio is synthesised.
 */
socialRouter.post("/", async (req, res) => {
  const parsed = parseSocialRequest(req.body);
  if (!parsed.ok) {
    return res.status(400).json({ error: parsed.error });
  }

  try {
    const generated = await generateSocialCarousel(parsed.request);
    const carousel = toSocialCarousel(generated, parsed.request);

    // A carousel that lost a slide would caption the wrong photograph, so a
    // malformed answer is reported rather than partly rendered.
    if (!carousel) {
      return res.status(502).json({ error: "The carousel came back incomplete, try again" });
    }

    res.json(carousel);
  } catch (error) {
    // Detail stays server-side: Gemini SDK errors name models and quota state.
    console.error("Social API Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
