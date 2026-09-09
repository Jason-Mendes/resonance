import { describe, it, expect, vi, beforeEach } from "vitest";

import { TransientError } from "../lib/errors.js";

import { chunkBySpeakerPairs, synthesizeDialogue, type ScriptTurn } from "./tts.js";

/**
 * Two things are covered here. The chunker, which decides what one request to
 * the dialogue model contains, and the retry around that request.
 *
 * The model is mocked. vi.mock is hoisted above these imports, so the client is
 * replaced before tts.js pulls it in; chunkBySpeakerPairs is pure and does not
 * reach it either way.
 */
const { generateContentMock } = vi.hoisted(() => ({ generateContentMock: vi.fn() }));

vi.mock("../lib/vertex.js", () => ({
  getVertexClient: () => ({ models: { generateContent: generateContentMock } }),
}));

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

const audioReply = {
  candidates: [
    { content: { parts: [{ inlineData: { data: Buffer.from("pcm").toString("base64") } }] } },
  ],
};

const voices = { HostA: "Algieba", HostB: "Aoede" };

describe("synthesizeDialogue", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("survives a chunk that fails once, rather than losing the episode", async () => {
    generateContentMock
      .mockRejectedValueOnce(new Error("429 rate limit"))
      .mockResolvedValueOnce(audioReply);

    const result = await synthesizeDialogue(turns("AB"), voices, "Read it.");

    expect(generateContentMock).toHaveBeenCalledTimes(2);
    expect(result.mimeType).toBe("audio/wav");
  });

  it("gives up after three attempts, and says so in words an editor can act on", async () => {
    generateContentMock.mockRejectedValue(new Error("503 model overloaded"));

    await expect(synthesizeDialogue(turns("AB"), voices, "Read it.")).rejects.toBeInstanceOf(
      TransientError,
    );
    expect(generateContentMock).toHaveBeenCalledTimes(3);
  });

  it("never leaks the model's own message, which names quota state", async () => {
    generateContentMock.mockRejectedValue(new Error("quota exceeded for project 12345"));

    await expect(synthesizeDialogue(turns("AB"), voices, "Read it.")).rejects.toThrow(
      "The audio service kept refusing. Please try again.",
    );
  });
});
