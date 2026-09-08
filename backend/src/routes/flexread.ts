import { Router } from 'express';
import { generateFlexReadLayers } from '../services/gemini.js';

export const flexreadRouter = Router();

flexreadRouter.post('/', async (req, res) => {
  try {
    const { articleText } = req.body;
    
    if (!articleText) {
      return res.status(400).json({ error: 'articleText is required' });
    }

    const layers = await generateFlexReadLayers(articleText);
    
    // We return the generated layers plus the full text (the deepest layer)
    res.json({
      ...layers,
      fullText: articleText
    });
  } catch (error) {
    console.error('FlexRead API Error:', error);
    // `error` is `unknown` under strict mode, so narrow before reading .message.
    const message =
      error instanceof Error ? error.message : 'Internal server error';
    res.status(500).json({ error: message });
  }
});
