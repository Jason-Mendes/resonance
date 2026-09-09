import express from "express";
import request from "supertest";
import { describe, it, expect, vi, beforeEach } from "vitest";

import { briefingRouter } from "./briefing.js";

/**
 * Both the summary and the synthesis are mocked. What is under test is which
 * Cloud TTS voice name the route resolves and hands to synthesis.
 */
const { generateFlexReadLayersMock, synthesizeBriefingMock } = vi.hoisted(() => ({
  generateFlexReadLayersMock: vi.fn(),
  synthesizeBriefingMock: vi.fn(),
}));

vi.mock("../services/gemini.js", () => ({ generateFlexReadLayers: generateFlexReadLayersMock }));
vi.mock("../services/tts.js", () => ({ synthesizeBriefing: synthesizeBriefingMock }));

const app = express();
app.use(express.json());
app.use("/api/briefing", briefingRouter);

const article = { articleText: "An article worth narrating." };

describe("POST /api/briefing voice selection", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    generateFlexReadLayersMock.mockResolvedValue({ summary60s: "A short summary." });
    synthesizeBriefingMock.mockResolvedValue({
      audio: Buffer.from("fake audio"),
      mimeType: "audio/mpeg",
      text: "A short summary.",
    });
  });

  it("keeps the voice the briefing already used when voice is omitted", async () => {
    await request(app).post("/api/briefing").send(article);

    await vi.waitFor(() =>
      expect(synthesizeBriefingMock).toHaveBeenCalledWith("A short summary.", "en-US-Studio-O"),
    );
  });

  it("resolves an id to its Cloud TTS name, across both tiers", async () => {
    const cases: [string, string][] = [
      ["studio-q", "en-US-Studio-Q"],
      ["algieba", "en-US-Chirp3-HD-Algieba"],
      ["aoede", "en-US-Chirp3-HD-Aoede"],
    ];

    for (const [id, expected] of cases) {
      synthesizeBriefingMock.mockClear();
      await request(app)
        .post("/api/briefing")
        .send({ ...article, voice: id });

      await vi.waitFor(() =>
        expect(synthesizeBriefingMock).toHaveBeenCalledWith(expect.any(String), expected),
      );
    }
  });

  it("rejects an unknown voice instead of quietly narrating in the default", async () => {
    const res = await request(app)
      .post("/api/briefing")
      .send({ ...article, voice: "morgan-freeman" });

    expect(res.status).toBe(400);
    expect(res.body.error).toContain("voice must be one of");
    expect(synthesizeBriefingMock).not.toHaveBeenCalled();
  });
});
