import { Router } from "express";

import {
  findForbiddenTerms,
  parseGenerationControls,
  toDeliveryInstruction,
} from "../lib/generation-controls.js";
import { createJob, getJob, runJob } from "../lib/jobs.js";
import { isVoicePair } from "../services/tts-voices.js";
import { synthesizeDialogue, type RenderedAudio, type ScriptTurn } from "../services/tts.js";

import type { VoicePairType } from "../services/tts-voices.js";

export const ttsRouter = Router();

const MAX_TURNS = 120;
const MAX_TURN_CHARS = 2_000;

function parseTurns(
  rawList: unknown[],
): { ok: true; turns: ScriptTurn[] } | { ok: false; error: string } {
  if (rawList.length > MAX_TURNS) {
    return { ok: false, error: `script must have at most ${MAX_TURNS} turns` };
  }
  const turns: ScriptTurn[] = [];
  for (const [index, raw] of rawList.entries()) {
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
  return { ok: true, turns };
}

function parseScript(
  body: unknown,
): { ok: true; script: ScriptTurn[]; voicePair?: VoicePairType } | { ok: false; error: string } {
  const container = body as { script?: unknown; voicePair?: unknown } | null;
  const script = container?.script;
  if (!Array.isArray(script) || script.length === 0) {
    return { ok: false, error: "script must be a non-empty array" };
  }
  const turnsResult = parseTurns(script);
  if (!turnsResult.ok) return turnsResult;

  const rawPair = container?.voicePair;
  if (isVoicePair(rawPair)) {
    return { ok: true, script: turnsResult.turns, voicePair: rawPair };
  }
  return { ok: true, script: turnsResult.turns };
}

/**
 * How the voices perform the script. Only the tone reaches synthesis here: the
 * avoid list was already enforced when the words were written, and these
 * voices cannot add a name that is not in the transcript.
 */

/** Submit a script. Returns immediately with a job id; synthesis runs after. */
ttsRouter.post("/", (req, res) => {
  const parsed = parseScript(req.body);
  if (!parsed.ok) {
    return res.status(400).json({ error: parsed.error });
  }

  const controls = parseGenerationControls(req.body);
  if (!controls.ok) {
    return res.status(400).json({ error: controls.error });
  }

  // The script arriving here is not the one the writer produced: the studio
  // lets a producer edit turns before rendering, so a banned word removed at
  // writing time can be typed back in. This is the last point before the
  // words become audio, which makes it the only place the rule can be kept.
  const spoken = parsed.script.map((turn) => turn.text).join(" ");
  const used = findForbiddenTerms(spoken, controls.controls.avoid);
  if (used.length > 0) {
    return res.status(422).json({ error: `The script uses: ${used.join(", ")}`, terms: used });
  }

  const delivery = toDeliveryInstruction(controls.controls.tone);
  const job = createJob<RenderedAudio>();
  runJob(job, (reportProgress) =>
    synthesizeDialogue(parsed.script, delivery, parsed.voicePair, reportProgress),
  );

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
    ...(job.retryable ? { retryable: true } : {}),
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
