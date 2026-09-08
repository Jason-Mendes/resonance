import { Router } from 'express';
import { generateFlexReadLayers } from '../services/gemini.js';

export const flexreadRouter = Router();

// Long-read articles run to roughly 20k characters. This caps what one request
// can push into a paid model call.
const MAX_ARTICLE_CHARS = 50_000;

flexreadRouter.post('/', async (req, res) => {
  try {
    const { articleText } = req.body;

    // Reject non-strings explicitly: `!articleText` alone lets objects and
    // arrays through to the model call.
    if (typeof articleText !== 'string' || articleText.trim().length === 0) {
      return res.status(400).json({ error: 'articleText must be a non-empty string' });
    }

    if (articleText.length > MAX_ARTICLE_CHARS) {
      return res.status(400).json({
        error: `articleText must be at most ${MAX_ARTICLE_CHARS} characters`,
      });
    }

    const layers = await generateFlexReadLayers(articleText);
    
    // We return the generated layers plus the full text (the deepest layer)
    res.json({
      ...layers,
      fullText: articleText
    });
  } catch (error) {
    // Detail stays server-side. Gemini SDK errors can name models and quota
    // state, none of which belongs in a response to an unauthenticated caller.
    console.error('FlexRead API Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});
