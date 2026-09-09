import express from "express";
import request from "supertest";
import { describe, it, expect } from "vitest";

import { voicesRouter } from "./voices.js";

const app = express();
app.use("/api/voices", voicesRouter);

describe("GET /api/voices", () => {
  it("offers three pairings and four briefing voices, with today's defaults", async () => {
    const res = await request(app).get("/api/voices");

    expect(res.status).toBe(200);
    expect(res.body.podcast.default).toBe("male-female");
    expect(res.body.podcast.pairings).toHaveLength(3);
    expect(res.body.briefing.default).toBe("studio-o");
    expect(res.body.briefing.voices).toHaveLength(4);
  });

  it("names a gender for every voice, so the frontend can label them", async () => {
    const { body } = await request(app).get("/api/voices");

    for (const voice of body.briefing.voices) {
      expect(["male", "female"]).toContain(voice.gender);
    }
    for (const pairing of body.podcast.pairings) {
      expect(["male", "female"]).toContain(pairing.hosts.HostA.gender);
      expect(["male", "female"]).toContain(pairing.hosts.HostB.gender);
    }
  });

  it("offers the four tones, with measured as the default", async () => {
    const { body } = await request(app).get("/api/voices");

    expect(body.tone.default).toBe("measured");
    expect(body.tone.options.map((option: { id: string }) => option.id)).toEqual([
      "measured",
      "conversational",
      "urgent",
      "explanatory",
    ]);
  });

  it("says tone changes delivery on the podcast only, since the briefing voices take no direction", async () => {
    const { body } = await request(app).get("/api/voices");

    expect(body.tone.changesDelivery).toEqual(["podcast"]);
  });

  it("returns a default that is actually one of the options it offers", async () => {
    const { body } = await request(app).get("/api/voices");

    const pairingIds = body.podcast.pairings.map((p: { id: string }) => p.id);
    const voiceIds = body.briefing.voices.map((v: { id: string }) => v.id);
    expect(pairingIds).toContain(body.podcast.default);
    expect(voiceIds).toContain(body.briefing.default);
  });
});
