import { Router } from "express";

import { parseArticleText } from "../lib/articleText.js";
import { createJob, getJob, runJob } from "../lib/jobs.js";
import { generateFlexReadLayers } from "../services/gemini.js";
import { synthesizeBriefing, type NarratedAudio } from "../services/tts.js";
import {
  BRIEFING_VOICES,
  DEFAULT_BRIEFING_VOICE_ID,
  resolveBriefingVoice,
} from "../services/voices.js";

export const briefingRouter = Router();

/**
 * Who narrates. Omitted keeps the voice the briefing already used, so an
 * existing caller hears no change.
 */
function parseVoice(body: unknown): { ok: true; voiceName: string } | { ok: false; error: string } {
  const requested = (body as { voice?: unknown } | null)?.voice ?? DEFAULT_BRIEFING_VOICE_ID;
  if (typeof requested !== "string") {
    return { ok: false, error: "voice must be a string" };
  }
  const voiceName = resolveBriefingVoice(requested);
  if (!voiceName) {
    const ids = BRIEFING_VOICES.map((voice) => voice.id).join(", ");
    return { ok: false, error: `voice must be one of: ${ids}` };
  }
  return { ok: true, voiceName };
}

/**
 * Article in, sixty seconds of audio out. Reuses the summary60s that FlexRead
 * already produces, so there is no second prompt to keep in step.
 */
briefingRouter.post("/", (req, res) => {
  const parsed = parseArticleText(req.body);
  if (!parsed.ok) {
    return res.status(400).json({ error: parsed.error });
  }

  const voice = parseVoice(req.body);
  if (!voice.ok) {
    return res.status(400).json({ error: voice.error });
  }

  const job = createJob<NarratedAudio>();
  runJob(job, async () => {
    const layers: unknown = await generateFlexReadLayers(parsed.articleText);
    const summary = (layers as { summary60s?: unknown })?.summary60s;
    if (typeof summary !== "string" || summary.trim() === "") {
      throw new Error("FlexRead returned no summary60s to narrate");
    }
    return synthesizeBriefing(summary, voice.voiceName);
  });

  res
    .status(202)
    .location(`/api/briefing/jobs/${job.id}`)
    .json({ jobId: job.id, status: job.status });
});

briefingRouter.get("/jobs/:jobId", (req, res) => {
  const job = getJob<NarratedAudio>(req.params.jobId);
  if (!job) {
    return res.status(404).json({ error: "job not found" });
  }
  res.json({
    jobId: job.id,
    status: job.status,
    createdAt: job.createdAt,
    updatedAt: job.updatedAt,
    ...(job.error ? { error: job.error } : {}),
    ...(job.progress !== undefined ? { progress: job.progress } : {}),
    // The narrated words ship with the status so the caller can show the
    // transcript. They exist only as a by-product of this render.
    ...(job.status === "done" && job.result
      ? { audioUrl: `/api/briefing/jobs/${job.id}/audio`, text: job.result.text }
      : {}),
  });
});

briefingRouter.get("/jobs/:jobId/audio", (req, res) => {
  const job = getJob<NarratedAudio>(req.params.jobId);
  if (!job) {
    return res.status(404).json({ error: "job not found" });
  }
  if (job.status !== "done" || !job.result) {
    return res.status(409).json({ error: `job is ${job.status}, audio not ready` });
  }
  res.type(job.result.mimeType).send(job.result.audio);
});
