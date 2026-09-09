import { describe, it, expect } from "vitest";

import { PublicError, TransientError } from "./errors.js";
import { createJob, getJob, runJob } from "./jobs.js";

/** Waits for the job to leave the running state. Work here settles at once. */
const settle = async (id: string) => {
  for (let attempt = 0; attempt < 50; attempt += 1) {
    const job = getJob(id);
    if (job && (job.status === "done" || job.status === "failed")) return job;
    await new Promise((resolve) => setTimeout(resolve, 5));
  }
  throw new Error("job never settled");
};

describe("runJob failure messages", () => {
  it("hides an internal error, which would name models and quota state", async () => {
    const job = createJob<string>();
    runJob(job, () => Promise.reject(new Error("quota exceeded for project 12345")));

    const settled = await settle(job.id);
    expect(settled.error).toBe("generation failed");
    expect(settled.retryable).toBe(false);
  });

  it("shows a PublicError, since its message was written for the caller", async () => {
    const job = createJob<string>();
    runJob(job, () => Promise.reject(new PublicError("The script kept using: Roche")));

    const settled = await settle(job.id);
    expect(settled.error).toBe("The script kept using: Roche");
    expect(settled.retryable).toBe(false);
  });

  it("marks a TransientError retryable, so the studio can offer another go", async () => {
    const job = createJob<string>();
    runJob(job, () => Promise.reject(new TransientError("The audio service kept refusing.")));

    const settled = await settle(job.id);
    expect(settled.error).toBe("The audio service kept refusing.");
    expect(settled.retryable).toBe(true);
  });
});
