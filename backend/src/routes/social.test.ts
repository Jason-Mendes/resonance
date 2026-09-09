import express from "express";
import request from "supertest";
import { describe, it, expect, vi } from "vitest";

import * as socialRequestParser from "../lib/social-request.js";
import * as geminiService from "../services/gemini.js";

import { socialRouter } from "./social.js";

import type { SocialRequestResult } from "../lib/social-request.js";

const app = express();
app.use(express.json());
app.use("/api/social", socialRouter);

const ARTICLE = "The Amoco Cadiz ran aground off Brittany in 1978.";

const parseGives = (imageCaptions: string[]): SocialRequestResult => ({
  ok: true,
  request: { articleText: ARTICLE, imageCaptions, tags: ["wissenschaft"] },
});

describe("POST /api/social", () => {
  it("returns 400 when the request is not valid", async () => {
    const res = await request(app).post("/api/social").send({ articleText: "" });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe("articleText must be a non-empty string");
  });

  it("returns a caption for every photograph", async () => {
    vi.spyOn(socialRequestParser, "parseSocialRequest").mockReturnValueOnce(
      parseGives(["A laboratory in Zurich", "The researcher at her bench"]),
    );
    vi.spyOn(geminiService, "generateSocialCarousel").mockResolvedValueOnce({
      intro: "What the reporter found.",
      slides: [{ caption: "First slide." }, { caption: "Second slide." }],
      hashtags: ["#Brittany", "wissenschaft", "brittany"],
    });

    const res = await request(app).post("/api/social").send({ articleText: "Content" });

    expect(res.status).toBe(200);
    expect(res.body.slides).toEqual([{ caption: "First slide." }, { caption: "Second slide." }]);
    // Lowercased, stripped of the hash it was told not to send, de-duplicated.
    expect(res.body.hashtags).toEqual(["brittany", "wissenschaft"]);
  });

  it("drops a hashtag the article does not support", async () => {
    vi.spyOn(socialRequestParser, "parseSocialRequest").mockReturnValueOnce(
      parseGives(["A wreck"]),
    );
    // "amocacadiz" is the real misspelling Gemini returned for "Amoco Cadiz".
    // "oilspilltruth" is the invented-slogan shape the prompt forbids.
    vi.spyOn(geminiService, "generateSocialCarousel").mockResolvedValueOnce({
      intro: "What the reporter found.",
      slides: [{ caption: "The wreck." }],
      hashtags: ["amococadiz", "amocacadiz", "oilspilltruth", "brittany"],
    });

    const res = await request(app).post("/api/social").send({ articleText: "Content" });

    expect(res.status).toBe(200);
    expect(res.body.hashtags).toEqual(["amococadiz", "brittany"]);
  });

  it("refuses a carousel with fewer captions than photographs", async () => {
    vi.spyOn(socialRequestParser, "parseSocialRequest").mockReturnValueOnce(
      parseGives(["A laboratory in Zurich", "The researcher at her bench"]),
    );
    // Two photographs, one caption. Rendering this would put the first slide's
    // words under the second picture.
    vi.spyOn(geminiService, "generateSocialCarousel").mockResolvedValueOnce({
      intro: "What the reporter found.",
      slides: [{ caption: "Only one." }],
      hashtags: ["zurich"],
    });

    const res = await request(app).post("/api/social").send({ articleText: "Content" });

    expect(res.status).toBe(502);
  });

  it("hides model failures behind a flat 500", async () => {
    vi.spyOn(socialRequestParser, "parseSocialRequest").mockReturnValueOnce(
      parseGives(["A photo"]),
    );
    vi.spyOn(geminiService, "generateSocialCarousel").mockRejectedValueOnce(
      new Error("429 quota exceeded for gemini-2.5-flash"),
    );

    const res = await request(app).post("/api/social").send({ articleText: "Content" });

    expect(res.status).toBe(500);
    expect(res.body.error).toBe("Internal server error");
  });
});
