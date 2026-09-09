/**
 * In-memory job store for work too slow to finish inside one request.
 *
 * Deliberately not a database. Jobs are lost on restart and are not shared
 * between instances, which is fine while the backend runs as a single process.
 * Moving to Firestore means replacing this file and nothing else.
 */
import { randomUUID } from "node:crypto";

export type JobStatus = "pending" | "running" | "done" | "failed";

export interface Job<TResult> {
  id: string;
  status: JobStatus;
  createdAt: string;
  updatedAt: string;
  /** 0 to 1, reported by the work itself. Absent when it cannot measure. */
  progress?: number;
  /** Populated only when status is 'done'. */
  result?: TResult;
  /** Populated only when status is 'failed'. Safe to show a caller. */
  error?: string;
}

/** Completed jobs are dropped after this long, so the map cannot grow forever. */
const JOB_TTL_MS = 60 * 60 * 1000;

const jobs = new Map<string, Job<unknown>>();

export function createJob<TResult>(): Job<TResult> {
  const now = new Date().toISOString();
  const job: Job<TResult> = { id: randomUUID(), status: "pending", createdAt: now, updatedAt: now };
  jobs.set(job.id, job as Job<unknown>);
  return job;
}

export function getJob<TResult>(id: string): Job<TResult> | undefined {
  return jobs.get(id) as Job<TResult> | undefined;
}

function update<TResult>(id: string, patch: Partial<Job<TResult>>): void {
  const job = jobs.get(id);
  if (!job) return;
  Object.assign(job, patch, { updatedAt: new Date().toISOString() });
}

/** Handed to the work so it can report how far along it is. */
export type ProgressReporter = (fraction: number) => void;

/**
 * Runs `work` in the background and records the outcome against the job.
 * Returns immediately: the caller responds with the job id, not the result.
 *
 * `work` receives a reporter. Work that can measure itself should call it, so
 * a caller polling the job sees movement rather than a status that sits on
 * "running" for a minute and then jumps to done.
 */
export function runJob<TResult>(
  job: Job<TResult>,
  work: (reportProgress: ProgressReporter) => Promise<TResult>,
): void {
  update<TResult>(job.id, { status: "running", progress: 0 });

  const reportProgress: ProgressReporter = (fraction) => {
    update<TResult>(job.id, { progress: Math.min(1, Math.max(0, fraction)) });
  };

  void work(reportProgress)
    .then((result) => update<TResult>(job.id, { status: "done", result }))
    .catch((error: unknown) => {
      // Full detail server-side; the stored message is what a caller may see.
      console.error(`Job ${job.id} failed:`, error);
      update<TResult>(job.id, { status: "failed", error: "generation failed" });
    })
    .finally(() => {
      setTimeout(() => jobs.delete(job.id), JOB_TTL_MS).unref();
    });
}
