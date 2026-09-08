import { Router } from 'express';
import { parseArticleText } from '../lib/articleText.js';
import { generatePodcastScript } from '../services/gemini.js';

export const podcastRouter = Router();

podcastRouter.post('/', async (req, res) => {
  const parsed = parseArticleText(req.body);
  if (!parsed.ok) {
    return res.status(400).json({ error: parsed.error });
  }

  try {
    const script = await generatePodcastScript(parsed.articleText);
    res.json({ script });
  } catch (error) {
    // Detail stays server-side. Gemini SDK errors can name models and quota
    // state, none of which belongs in a response to an anonymous caller.
    console.error('Podcast API Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});
