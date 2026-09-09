import express from "express";
import request from "supertest";
import { describe, it, expect, vi } from "vitest";

import * as articleTextParser from "../lib/articleText.js";
import { ForbiddenTermsError } from "../lib/generation-controls.js";
import * as geminiService from "../services/gemini.js";

import { podcastRouter } from "./podcast.js";

import type { ArticleTextResult } from "../lib/articleText.js";

const parseFails: ArticleTextResult = { ok: false, error: "Missing text" };
const parseGives = (articleText: string): ArticleTextResult => ({ ok: true, articleText });

const app = express();
app.use(express.json());
app.use("/api/podcast", podcastRouter);

describe("POST /api/podcast", () => {
  it("returns 400 if article text parsing fails", async () => {
    vi.spyOn(articleTextParser, "parseArticleText").mockReturnValueOnce(parseFails);

    const res = await request(app).post("/api/podcast").send({});
    expect(res.status).toBe(400);
    expect(res.body.error).toBe("Missing text");
  });

  it("returns script and hosts on success", async () => {
    vi.spyOn(articleTextParser, "parseArticleText").mockReturnValueOnce(parseGives("Content"));

    const mockOutput = { topic: "Science", script: [{ speaker: "HostA", text: "Hello" }] };
    vi.spyOn(geminiService, "generatePodcastScript").mockResolvedValueOnce(mockOutput);

    const res = await request(app).post("/api/podcast").send({ articleText: "Content" });
    expect(res.status).toBe(200);
    expect(res.body.topic).toBe("Science");
    expect(res.body.script).toEqual(mockOutput.script);
    expect(Array.isArray(res.body.hosts)).toBe(true);
    expect(res.body.hosts[0].id).toBe("HostA");
  });

  it("returns appropriate hosts for chosen voicePair", async () => {
    vi.spyOn(articleTextParser, "parseArticleText").mockReturnValueOnce(parseGives("Content"));
    vi.spyOn(geminiService, "generatePodcastScript").mockResolvedValueOnce({
      topic: "General",
      script: [],
    });

    const res = await request(app)
      .post("/api/podcast")
      .send({ articleText: "Content", voicePair: "female_female" });
    expect(res.status).toBe(200);
    expect(res.body.hosts[0].gender).toBe("female");
    expect(res.body.hosts[1].gender).toBe("female");
  });

  it("returns generic 500 error and obscures internal SDK errors", async () => {
    vi.spyOn(articleTextParser, "parseArticleText").mockReturnValueOnce(parseGives("Content"));

    vi.spyOn(geminiService, "generatePodcastScript").mockRejectedValueOnce(
      new Error("Secret SDK model quota error"),
    );

    const res = await request(app).post("/api/podcast").send({ articleText: "Content" });
    expect(res.status).toBe(500);
    expect(res.body.error).toBe("Internal server error");
  });
});

describe("POST /api/podcast generation controls", () => {
  it("rejects a tone that is not a preset, before spending a model call", async () => {
    const generate = vi.spyOn(geminiService, "generatePodcastScript");

    const res = await request(app)
      .post("/api/podcast")
      .send({ articleText: "An article.", tone: "sarcastic" });

    expect(res.status).toBe(400);
    expect(res.body.error).toContain("tone must be one of");
    expect(generate).not.toHaveBeenCalled();
  });

  it("answers 422 with the offending words when the model would not comply", async () => {
    vi.spyOn(geminiService, "generatePodcastScript").mockRejectedValueOnce(
      new ForbiddenTermsError(["Roche"]),
    );

    const res = await request(app)
      .post("/api/podcast")
      .send({ articleText: "An article.", avoid: ["Roche"] });

    expect(res.status).toBe(422);
    expect(res.body.terms).toEqual(["Roche"]);
  });
});
