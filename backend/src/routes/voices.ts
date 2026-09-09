import { Router } from "express";

import {
  BRIEFING_VOICES,
  DEFAULT_BRIEFING_VOICE_ID,
  DEFAULT_PAIRING,
  HOST_PAIRINGS,
  describePairing,
} from "../services/voices.js";

export const voicesRouter = Router();

/**
 * The catalogue the frontend builds its pickers from, so no voice id is
 * hardcoded in two places. A constant read: no model call and nothing to bill,
 * which is also why the rate limiter skips it as a GET.
 */
voicesRouter.get("/", (_req, res) => {
  res.json({
    podcast: {
      default: DEFAULT_PAIRING,
      pairings: HOST_PAIRINGS.map(describePairing),
    },
    briefing: {
      default: DEFAULT_BRIEFING_VOICE_ID,
      voices: BRIEFING_VOICES.map(({ id, label, gender }) => ({ id, label, gender })),
    },
  });
});
