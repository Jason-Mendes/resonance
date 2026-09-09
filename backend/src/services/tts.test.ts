import { describe, it, expect } from "vitest";

import { chunkBySpeakerPairs, type ScriptTurn } from "./tts.js";

/**
 * Every chunk becomes one multiSpeakerVoiceConfig request, and Vertex rejects
 * any whose transcript does not name exactly two speakers:
 * "the number of speaker_voice_configs must equal 2".
 */
const turns = (speakers: string): ScriptTurn[] =>
  [...speakers].map((speaker, index) => ({ speaker: `Host${speaker}`, text: `Line ${index}` }));

const distinctSpeakers = (chunk: ScriptTurn[]): number =>
  new Set(chunk.map((turn) => turn.speaker)).size;

describe("chunkBySpeakerPairs", () => {
  it("gives every chunk two speakers when a host takes two turns in a row", () => {
    // The prompt asks the hosts to alternate but nothing enforces it, and this
    // is the shape that failed in production: the middle pair is A then A.
    const chunks = chunkBySpeakerPairs(turns("ABAABA"));

    expect(chunks.every((chunk) => distinctSpeakers(chunk) === 2)).toBe(true);
  });

  // Exhaustive over every arrangement of two hosts up to eight turns, because
  // the model writes the script and we cannot predict which shapes it produces.
  it("never emits a one-voice chunk for any two-host script", () => {
    for (let length = 2; length <= 8; length += 1) {
      for (let mask = 0; mask < 2 ** length; mask += 1) {
        const pattern = [...Array(length)]
          .map((_, bit) => ((mask >> bit) & 1 ? "B" : "A"))
          .join("");
        const script = turns(pattern);
        if (distinctSpeakers(script) < 2) continue; // one host only: no dialogue to render

        const chunks = chunkBySpeakerPairs(script);
        expect(
          chunks.every((chunk) => distinctSpeakers(chunk) === 2),
          pattern,
        ).toBe(true);
        expect(chunks.flat(), pattern).toEqual(script);
      }
    }
  });

  it("keeps every turn, in order", () => {
    const script = turns("ABAABA");
    const chunks = chunkBySpeakerPairs(script);

    expect(chunks.flat()).toEqual(script);
  });
});
