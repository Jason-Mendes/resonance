import express from "express";
import request from "supertest";
import { describe, it, expect, vi, beforeEach } from "vitest";

import { briefingRouter } from "./briefing.js";

/**
 * Both the summary and the synthesis are mocked. What is under test is that
 * the route narrates the summary FlexRead already produced, rather than
 * prompting a second time for words that would come back different.
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

describe("POST /api/briefing", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    generateFlexReadLayersMock.mockResolvedValue({ summary60s: "A short summary." });
    synthesizeBriefingMock.mockResolvedValue({
      audio: Buffer.from("fake audio"),
      mimeType: "audio/mpeg",
      text: "A short summary.",
    });
  });

  it("narrates the summary FlexRead produced", async () => {
    const res = await request(app).post("/api/briefing").send(article);

    expect(res.status).toBe(202);
    await vi.waitFor(() =>
      expect(synthesizeBriefingMock).toHaveBeenCalledWith("A short summary."),
    );
  });

  it("fails the job rather than narrating nothing when there is no summary", async () => {
    generateFlexReadLayersMock.mockResolvedValue({});

    const res = await request(app).post("/api/briefing").send(article);

    expect(res.status).toBe(202);
    await vi.waitFor(() => expect(synthesizeBriefingMock).not.toHaveBeenCalled());
  });
});
