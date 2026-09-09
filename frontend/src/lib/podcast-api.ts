/**
 * Every call the studio makes to this app's own routes. Separated from the
 * generation hook so that one holds state and orchestration while this holds
 * transport, and neither grows past what fits in a reading.
 */
import { BackendScriptTurn } from "@/lib/podcast-script";

export interface ReadingLayers {
  summary60s: string;
  keyPoints: string[];
}

/** What a finished production hands back. Notes are null if they failed. */
export interface ProducedAudio {
  audioUrl: string;
  waveform: number[];
  notes: ReadingLayers | null;
}

/**
 * Show notes come from the same reading layers the summary format narrates.
 * Requested next to the render rather than before it, so notes never delay
 * audio, and a failure here leaves a working episode with an empty tab.
 */
export const fetchReadingLayers = async (articleId: string): Promise<ReadingLayers> => {
  const response = await fetch("/api/flexread", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ articleId }),
  });
  if (!response.ok) throw new Error("Could not load the reading layers");

  const payload = (await response.json()) as Partial<ReadingLayers>;
  return {
    summary60s: payload.summary60s ?? "",
    keyPoints: Array.isArray(payload.keyPoints) ? payload.keyPoints : [],
  };
};

export const fetchScript = async (articleId: string): Promise<BackendScriptTurn[]> => {
  const response = await fetch("/api/podcast", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ articleId }),
  });

  const payload: unknown = await response.json().catch(() => null);
  if (!response.ok) {
    const message = (payload as { error?: unknown })?.error;
    throw new Error(typeof message === "string" ? message : "Could not generate the script");
  }

  return ((payload as { script?: BackendScriptTurn[] })?.script ?? []).filter(
    (turn) => typeof turn?.text === "string" && turn.text.trim() !== "",
  );
};

// A dialogue render takes upwards of a minute, so a slower poll costs nothing
// in perceived latency and keeps the request count low.
const POLL_INTERVAL_MS = 3_000;
const POLL_TIMEOUT_MS = 5 * 60 * 1000;
export const SCRIPT_DONE_PROGRESS = 55;

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

interface JobStatus {
  status: "pending" | "running" | "done" | "failed";
  error?: string;
}

/**
 * Starts a briefing and waits for it. Unlike the podcast this is one job: the
 * summary is written and narrated inside it, so the words come back with the
 * audio rather than being fetched separately, which would run the model again
 * and produce text the voice never said.
 */
export const renderSummary = async (
  articleId: string,
): Promise<{ audioUrl: string; text: string }> => {
  const start = await fetch("/api/briefing", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ articleId }),
  });

  const accepted: unknown = await start.json().catch(() => null);
  const jobId = (accepted as { jobId?: unknown })?.jobId;
  if (!start.ok || typeof jobId !== "string") {
    const message = (accepted as { error?: unknown })?.error;
    throw new Error(typeof message === "string" ? message : "Could not start the summary");
  }

  const deadline = Date.now() + POLL_TIMEOUT_MS;
  while (Date.now() < deadline) {
    await wait(POLL_INTERVAL_MS);
    const poll = await fetch(`/api/briefing/jobs/${jobId}`);
    const job = (await poll.json().catch(() => null)) as (JobStatus & { text?: string }) | null;

    if (job?.status === "done") {
      return { audioUrl: `/api/briefing/jobs/${jobId}/audio`, text: job.text ?? "" };
    }
    if (job?.status === "failed") throw new Error(job.error ?? "The summary failed");
  }

  throw new Error("The summary timed out");
};

/** Starts a render and resolves with the audio URL once the job reports done. */
export const renderAudio = async (script: BackendScriptTurn[]): Promise<string> => {
  const start = await fetch("/api/tts", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ script }),
  });

  const accepted: unknown = await start.json().catch(() => null);
  const jobId = (accepted as { jobId?: unknown })?.jobId;
  if (!start.ok || typeof jobId !== "string") {
    const message = (accepted as { error?: unknown })?.error;
    throw new Error(typeof message === "string" ? message : "Could not start the audio render");
  }

  const deadline = Date.now() + POLL_TIMEOUT_MS;
  while (Date.now() < deadline) {
    await wait(POLL_INTERVAL_MS);
    const poll = await fetch(`/api/tts/jobs/${jobId}`);
    const job = (await poll.json().catch(() => null)) as JobStatus | null;

    if (job?.status === "done") return `/api/tts/jobs/${jobId}/audio`;
    if (job?.status === "failed") throw new Error(job.error ?? "The audio render failed");
  }

  throw new Error("The audio render timed out");
};
