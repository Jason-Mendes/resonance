import express from "express";
import request from "supertest";
import { describe, it, expect, vi, beforeEach } from "vitest";

import { ttsRouter } from "./tts.js";

/**
 * Synthesis is mocked throughout. These check the job protocol and the input
 * caps, which are what stop one request spending an unbounded amount on a
 * paid model call.
 */
const { synthesizeDialogueMock } = vi.hoisted(() => ({ synthesizeDialogueMock: vi.fn() }));

vi.mock("../services/tts.js", () => ({ synthesizeDialogue: synthesizeDialogueMock }));

const app = express();
app.use(express.json());
app.use("/api/tts", ttsRouter);

const turn = (speaker: string, text: string) => ({ speaker, text });
const validScript = [turn("HostA", "Opening line."), turn("HostB", "A reply.")];

describe("POST /api/tts", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    synthesizeDialogueMock.mockResolvedValue({
      audio: Buffer.from("fake audio"),
      mimeType: "audio/wav",
    });
  });

  it("accepts a valid script and returns a job id", async () => {
    const res = await request(app).post("/api/tts").send({ script: validScript });

    expect(res.status).toBe(202);
    expect(typeof res.body.jobId).toBe("string");
    expect(res.headers.location).toBe(`/api/tts/jobs/${res.body.jobId}`);
  });

  it("rejects a missing or empty script", async () => {
    for (const body of [{}, { script: [] }, { script: "not an array" }]) {
      const res = await request(app).post("/api/tts").send(body);
      expect(res.status).toBe(400);
      expect(res.body.error).toBe("script must be a non-empty array");
    }
  });

  it("rejects a turn without a speaker or with empty text", async () => {
    const cases = [[{ text: "no speaker" }], [turn("HostA", "   ")], [{ speaker: "HostA" }]];
    for (const script of cases) {
      const res = await request(app).post("/api/tts").send({ script });
      expect(res.status).toBe(400);
      expect(res.body.error).toContain("needs a speaker and non-empty text");
    }
  });

  it("caps turn count and turn length, so one request cannot spend without bound", async () => {
    const tooManyTurns = Array.from({ length: 121 }, () => turn("HostA", "line"));
    const tooLongTurn = [turn("HostA", "x".repeat(2001))];

    const many = await request(app).post("/api/tts").send({ script: tooManyTurns });
    expect(many.status).toBe(400);
    expect(many.body.error).toContain("at most 120 turns");

    const long = await request(app).post("/api/tts").send({ script: tooLongTurn });
    expect(long.status).toBe(400);
    expect(long.body.error).toContain("exceeds 2000 characters");
  });
});

// Generous on purpose. Synthesis is mocked so a job settles in a millisecond,
// and the loop returns the moment it does, so a large budget costs nothing
// when passing. The earlier 200ms budget made the suite fail under load,
// which is a property of the machine rather than of the code being tested.
const SETTLE_ATTEMPTS = 100;
const SETTLE_INTERVAL_MS = 50;

/** Submits a script and waits for the job to leave the running state. */
const renderAndSettle = async () => {
  const { body } = await request(app).post("/api/tts").send({ script: validScript });
  for (let attempt = 0; attempt < SETTLE_ATTEMPTS; attempt += 1) {
    const status = await request(app).get(`/api/tts/jobs/${body.jobId}`);
    if (status.body.status === "done" || status.body.status === "failed") return status;
    await new Promise((resolve) => setTimeout(resolve, SETTLE_INTERVAL_MS));
  }
  throw new Error("job never settled");
};

describe("GET /api/tts/jobs/:jobId", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    synthesizeDialogueMock.mockResolvedValue({
      audio: Buffer.from("fake audio"),
      mimeType: "audio/wav",
    });
  });

  it("404s for a job id that was never issued", async () => {
    const res = await request(app).get("/api/tts/jobs/not-a-real-id");
    expect(res.status).toBe(404);
    expect(res.body.error).toBe("job not found");
  });

  it("reaches done and offers the audio url", async () => {
    const settled = await renderAndSettle();
    expect(settled.body.status).toBe("done");
    expect(settled.body.audioUrl).toBe(`/api/tts/jobs/${settled.body.jobId}/audio`);
  });

  it("reports failure without leaking why", async () => {
    synthesizeDialogueMock.mockRejectedValueOnce(new Error("quota exceeded for project 12345"));

    const settled = await renderAndSettle();
    expect(settled.body.status).toBe("failed");
    // The real reason names quota and project state; a caller sees neither.
    expect(settled.body.error).toBe("generation failed");
  });
});

describe("GET /api/tts/jobs/:jobId/audio", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    synthesizeDialogueMock.mockResolvedValue({
      audio: Buffer.from("fake audio"),
      mimeType: "audio/wav",
    });
  });

  it("404s for an unknown job", async () => {
    const res = await request(app).get("/api/tts/jobs/not-a-real-id/audio");
    expect(res.status).toBe(404);
  });

  it("409s while the render is still running, rather than 404", async () => {
    // Never resolves, so the job stays running for the length of this test.
    synthesizeDialogueMock.mockReturnValueOnce(new Promise(() => {}));

    const { body } = await request(app).post("/api/tts").send({ script: validScript });
    const res = await request(app).get(`/api/tts/jobs/${body.jobId}/audio`);

    expect(res.status).toBe(409);
    expect(res.body.error).toContain("audio not ready");
  });

  it("serves the audio with the mime type the render produced", async () => {
    const settled = await renderAndSettle();
    const res = await request(app).get(`/api/tts/jobs/${settled.body.jobId}/audio`);

    expect(res.status).toBe(200);
    expect(res.headers["content-type"]).toContain("audio/wav");
    expect(res.body).toEqual(Buffer.from("fake audio"));
  });
});

describe("POST /api/tts host pairing", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    synthesizeDialogueMock.mockResolvedValue({
      audio: Buffer.from("fake audio"),
      mimeType: "audio/wav",
    });
  });

  it("keeps the voices the podcast already had when hosts is omitted", async () => {
    await request(app).post("/api/tts").send({ script: validScript });

    expect(synthesizeDialogueMock).toHaveBeenCalledWith(
      validScript,
      { HostA: "Algieba", HostB: "Aoede" },
      // Omitting tone must reach the voices with the exact sentence that used
      // to be hardcoded, or an existing caller's audio changes under them.
      "Read this as a natural two-host news podcast. Conversational and engaged, at the pace of real radio.",
      expect.any(Function),
    );
  });

  it("gives a same-gender pairing two different voices", async () => {
    for (const hosts of ["male-male", "female-female"]) {
      synthesizeDialogueMock.mockClear();
      await request(app).post("/api/tts").send({ script: validScript, hosts });

      const call = synthesizeDialogueMock.mock.calls.at(0);
      if (!call) {
        throw new Error(`${hosts} never reached synthesis`);
      }
      const voices = call[1] as Record<string, string>;
      expect(voices.HostA, `${hosts} collapsed to one voice`).not.toBe(voices.HostB);
    }
  });

  it("rejects an unknown pairing instead of quietly using the default", async () => {
    const res = await request(app)
      .post("/api/tts")
      .send({ script: validScript, hosts: "male-robot" });

    expect(res.status).toBe(400);
    expect(res.body.error).toContain("hosts must be one of");
    expect(synthesizeDialogueMock).not.toHaveBeenCalled();
  });
});

describe("POST /api/tts avoided terms", () => {
  it("refuses to synthesise a turn a producer edited a banned name back into", async () => {
    const edited = [
      { speaker: "HostA", text: "Roche halted the trial." },
      { speaker: "HostB", text: "That is a significant reversal." },
    ];

    const res = await request(app)
      .post("/api/tts")
      .send({ script: edited, avoid: ["Roche"] });

    expect(res.status).toBe(422);
    expect(res.body.terms).toEqual(["Roche"]);
    expect(synthesizeDialogueMock).not.toHaveBeenCalled();
  });

  it("renders normally when the edited script keeps the rule", async () => {
    const clean = [
      { speaker: "HostA", text: "The manufacturer halted the trial." },
      { speaker: "HostB", text: "That is a significant reversal." },
    ];

    const res = await request(app)
      .post("/api/tts")
      .send({ script: clean, avoid: ["Roche"] });

    expect(res.status).toBe(202);
    expect(synthesizeDialogueMock).toHaveBeenCalledTimes(1);
  });
});
