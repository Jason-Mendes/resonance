/**
 * Every call the studio makes to this app's own routes. Separated from the
 * generation hook so that one holds state and orchestration while this holds
 * transport, and neither grows past what fits in a reading.
 */
import { BackendScriptTurn } from "@/lib/podcast-script";
import { VoicePair } from "@/types/podcast";

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

export interface FetchScriptResult {
  topic?: string;
  script: BackendScriptTurn[];
  hosts?: { id: string; name: string; gender: "male" | "female"; role: string; voice: string }[];
}

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

export const fetchScript = async (
  articleId: string,
  voicePair?: VoicePair,
): Promise<FetchScriptResult> => {
  const response = await fetch("/api/podcast", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ articleId, ...(voicePair ? { voicePair } : {}) }),
  });

  const payload: unknown = await response.json().catch(() => null);
  if (!response.ok) {
    const message = (payload as { error?: unknown })?.error;
    throw new Error(typeof message === "string" ? message : "Could not generate the script");
  }

  const container = payload as {
    topic?: string;
    script?: BackendScriptTurn[];
    hosts?: FetchScriptResult["hosts"];
  };
  const turns = (container?.script ?? []).filter(
    (turn) => typeof turn?.text === "string" && turn.text.trim() !== "",
  );
  return { topic: container?.topic, script: turns, hosts: container?.hosts };
};

const POLL_INTERVAL_MS = 3_000;
const POLL_TIMEOUT_MS = 5 * 60 * 1000;
export const SCRIPT_DONE_PROGRESS = 55;

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

interface JobStatus {
  status: "pending" | "running" | "done" | "failed";
  error?: string;
  progress?: number;
}

const pollBriefingJob = async (jobId: string): Promise<{ audioUrl: string; text: string }> => {
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

  return pollBriefingJob(jobId);
};

const pollTtsJob = async (
  jobId: string,
  onProgress?: (fraction: number) => void,
): Promise<string> => {
  const deadline = Date.now() + POLL_TIMEOUT_MS;
  while (Date.now() < deadline) {
    await wait(POLL_INTERVAL_MS);
    const poll = await fetch(`/api/tts/jobs/${jobId}`);
    const job = (await poll.json().catch(() => null)) as JobStatus | null;

    if (typeof job?.progress === "number") onProgress?.(job.progress);
    if (job?.status === "done") return `/api/tts/jobs/${jobId}/audio`;
    if (job?.status === "failed") throw new Error(job.error ?? "The audio render failed");
  }
  throw new Error("The audio render timed out");
};

export const renderAudio = async (
  script: BackendScriptTurn[],
  onProgress?: (fraction: number) => void,
  voicePair?: VoicePair,
): Promise<string> => {
  const start = await fetch("/api/tts", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ script, ...(voicePair ? { voicePair } : {}) }),
  });

  const accepted: unknown = await start.json().catch(() => null);
  const jobId = (accepted as { jobId?: unknown })?.jobId;
  if (!start.ok || typeof jobId !== "string") {
    const message = (accepted as { error?: unknown })?.error;
    throw new Error(typeof message === "string" ? message : "Could not start the audio render");
  }

  return pollTtsJob(jobId, onProgress);
};
