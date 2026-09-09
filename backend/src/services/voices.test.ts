import { describe, it, expect } from "vitest";

import {
  BRIEFING_VOICES,
  DEFAULT_BRIEFING_VOICE_ID,
  DEFAULT_PAIRING,
  DIALOGUE_VOICES,
  HOST_PAIRINGS,
  resolveBriefingVoice,
  resolvePairing,
} from "./voices.js";

describe("host pairings", () => {
  it("defaults to the pair that was already chosen by ear", () => {
    expect(DEFAULT_PAIRING).toBe("male-female");
    expect(resolvePairing("male-female")).toEqual({ HostA: "Algieba", HostB: "Aoede" });
  });
});

describe("pairing invariants", () => {
  it("never gives both hosts the same voice, or they are indistinguishable", () => {
    for (const pairing of HOST_PAIRINGS) {
      const { HostA, HostB } = resolvePairing(pairing);
      expect(HostA, `${pairing} gave both hosts ${HostA}`).not.toBe(HostB);
    }
  });

  it("uses voices of the genders the pairing name promises", () => {
    const genderOf = (gemini: string) =>
      DIALOGUE_VOICES.find((voice) => voice.gemini === gemini)?.gender;

    for (const pairing of HOST_PAIRINGS) {
      const [first, second] = pairing.split("-");
      const { HostA, HostB } = resolvePairing(pairing);
      expect(genderOf(HostA)).toBe(first);
      expect(genderOf(HostB)).toBe(second);
    }
  });
});

describe("briefing voices", () => {
  it("defaults to the voice the briefing already uses", () => {
    expect(DEFAULT_BRIEFING_VOICE_ID).toBe("studio-o");
    expect(resolveBriefingVoice(DEFAULT_BRIEFING_VOICE_ID)).toBe("en-US-Studio-O");
  });

  it("offers at least four voices, at least two of each gender", () => {
    expect(BRIEFING_VOICES.length).toBeGreaterThanOrEqual(4);
    const countOf = (gender: string) =>
      BRIEFING_VOICES.filter((voice) => voice.gender === gender).length;
    expect(countOf("male")).toBeGreaterThanOrEqual(2);
    expect(countOf("female")).toBeGreaterThanOrEqual(2);
  });

  it("returns undefined for an unknown id, so a route can 400 instead of guessing", () => {
    expect(resolveBriefingVoice("not-a-voice")).toBeUndefined();
  });
});
