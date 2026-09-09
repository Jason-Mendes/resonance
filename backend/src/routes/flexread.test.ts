import express from "express";
import request from "supertest";
import { describe, it, expect, vi } from "vitest";

import * as articleTextParser from "../lib/articleText.js";
import * as geminiService from "../services/gemini.js";

import { flexreadRouter } from "./flexread.js";

import type { ArticleTextResult } from "../lib/articleText.js";

const parseFails: ArticleTextResult = { ok: false, error: "Missing text" };
const parseGives = (articleText: string): ArticleTextResult => ({ ok: true, articleText });

// Setup mock express app
const app = express();
app.use(express.json());
app.use("/api/flexread", flexreadRouter);

describe("POST /api/flexread", () => {
  it("returns 400 if article text parsing fails", async () => {
    vi.spyOn(articleTextParser, "parseArticleText").mockReturnValueOnce(parseFails);

    const res = await request(app).post("/api/flexread").send({});
    expect(res.status).toBe(400);
    expect(res.body.error).toBe("Missing text");
  });

  it("returns layers and full text on success", async () => {
    vi.spyOn(articleTextParser, "parseArticleText").mockReturnValueOnce(
      parseGives("Full article content here"),
    );

    const mockLayers = {
      headline: "Test",
      summary60s: "Summary",
      keyPoints: ["Point"],
    };

    vi.spyOn(geminiService, "generateFlexReadLayers").mockResolvedValueOnce(mockLayers);

    const res = await request(app)
      .post("/api/flexread")
      .send({ articleText: "Full article content here" });

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      ...mockLayers,
      fullText: "Full article content here",
    });
  });

  it("handles service errors gracefully", async () => {
    vi.spyOn(articleTextParser, "parseArticleText").mockReturnValueOnce(parseGives("Content"));

    vi.spyOn(geminiService, "generateFlexReadLayers").mockRejectedValueOnce(new Error("AI failed"));

    const res = await request(app).post("/api/flexread").send({ articleText: "Content" });

    expect(res.status).toBe(500);
    expect(res.body.error).toBe("Internal server error");
  });
});
