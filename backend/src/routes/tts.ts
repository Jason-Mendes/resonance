import { Router } from "express";

import { createJob, getJob, runJob } from "../lib/jobs.js";
import { synthesizeDialogue, type RenderedAudio, type ScriptTurn } from "../services/tts.js";
import {
  DEFAULT_PAIRING,
  HOST_PAIRINGS,
  isHostPairing,
  resolvePairing,
  type HostPairing,
} from "../services/voices.js";

export const ttsRouter = Router();

// A 3-4 minute two-host dialogue is roughly 40 turns. The cap stops one
// request from spending an unbounded amount on synthesis.
const MAX_TURNS = 120;
const MAX_TURN_CHARS = 2_000;

function parseScript(
  body: unknown,
): { ok: true; script: ScriptTurn[] } | { ok: false; error: string } {
  const script = (body as { script?: unknown } | null)?.script;
  if (!Array.isArray(script) || script.length === 0) {
    return { ok: false, error: "script must be a non-empty array" };
  }
  if (script.length > MAX_TURNS) {
    return { ok: false, error: `script must have at most ${MAX_TURNS} turns` };
  }
  const turns: ScriptTurn[] = [];
  for (const [index, raw] of script.entries()) {
    const turn = raw as { speaker?: unknown; text?: unknown };
    if (
      typeof turn?.speaker !== "string" ||
      typeof turn?.text !== "string" ||
      turn.text.trim() === ""
    ) {
      return { ok: false, error: `turn ${index} needs a speaker and non-empty text` };
    }
    if (turn.text.length > MAX_TURN_CHARS) {
      return { ok: false, error: `turn ${index} exceeds ${MAX_TURN_CHARS} characters` };
    }
    turns.push({ speaker: turn.speaker, text: turn.text });
  }
  return { ok: true, script: turns };
}

/**
 * Which two voices read the script. Omitted keeps what the podcast already
 * sounded like, so an existing caller is unaffected by this field existing.
 */
function parseHosts(
  body: unknown,
): { ok: true; pairing: HostPairing } | { ok: false; error: string } {
  const hosts = (body as { hosts?: unknown } | null)?.hosts;
  if (hosts === undefined) {
    return { ok: true, pairing: DEFAULT_PAIRING };
  }
  if (!isHostPairing(hosts)) {
    return { ok: false, error: `hosts must be one of: ${HOST_PAIRINGS.join(", ")}` };
  }
  return { ok: true, pairing: hosts };
}

/** Submit a script. Returns immediately with a job id; synthesis runs after. */
ttsRouter.post("/", (req, res) => {
  const parsed = parseScript(req.body);
  if (!parsed.ok) {
    return res.status(400).json({ error: parsed.error });
  }

  const hosts = parseHosts(req.body);
  if (!hosts.ok) {
    return res.status(400).json({ error: hosts.error });
  }

  const voices = resolvePairing(hosts.pairing);
  const job = createJob<RenderedAudio>();
  runJob(job, (reportProgress) => synthesizeDialogue(parsed.script, voices, reportProgress));

  // 202: accepted, not finished. Location points at the status endpoint.
  res.status(202).location(`/api/tts/jobs/${job.id}`).json({ jobId: job.id, status: job.status });
});

/** Poll this until status is done or failed. */
ttsRouter.get("/jobs/:jobId", (req, res) => {
  const job = getJob<RenderedAudio>(req.params.jobId);
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
    ...(job.status === "done" ? { audioUrl: `/api/tts/jobs/${job.id}/audio` } : {}),
  });
});

/** The finished MP3. Only available once the job is done. */
ttsRouter.get("/jobs/:jobId/audio", (req, res) => {
  const job = getJob<RenderedAudio>(req.params.jobId);
  if (!job) {
    return res.status(404).json({ error: "job not found" });
  }
  if (job.status !== "done" || !job.result) {
    return res.status(409).json({ error: `job is ${job.status}, audio not ready` });
  }
  res.type(job.result.mimeType).send(job.result.audio);
});
