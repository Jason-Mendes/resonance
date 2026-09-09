import { Router } from "express";

import { parseArticleText } from "../lib/articleText.js";
import { generateFlexReadLayers } from "../services/gemini.js";

export const flexreadRouter = Router();

flexreadRouter.post("/", async (req, res) => {
  const parsed = parseArticleText(req.body);
  if (!parsed.ok) {
    return res.status(400).json({ error: parsed.error });
  }

  try {
    const layers = await generateFlexReadLayers(parsed.articleText);

    // What the model returned is unverified, so a non-object becomes an empty
    // one rather than being spread. The caller then sees the fullText layer
    // and no others, which is a thin response instead of a 500.
    const generated = typeof layers === "object" && layers !== null ? layers : {};

    // The full text is the deepest layer, returned alongside the generated ones.
    res.json({ ...generated, fullText: parsed.articleText });
  } catch (error) {
    // Detail stays server-side. Gemini SDK errors can name models and quota
    // state, none of which belongs in a response to an anonymous caller.
    console.error("FlexRead API Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
