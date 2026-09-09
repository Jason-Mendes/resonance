import { describe, it, expect, vi, beforeEach } from "vitest";

import { TransientError } from "../lib/errors.js";

/**
 * The dialogue model is mocked. These check the retry, which exists because a
 * preview endpoint called several times at once answers some of those calls
 * with a rate limit, and Promise.all would lose the whole episode to one.
 */
const { generateContentMock } = vi.hoisted(() => ({ generateContentMock: vi.fn() }));

vi.mock("../lib/vertex.js", () => ({
  getVertexClient: () => ({ models: { generateContent: generateContentMock } }),
}));

const { synthesizeDialogue } = await import("./tts.js");

const audioReply = {
  candidates: [
    { content: { parts: [{ inlineData: { data: Buffer.from("pcm").toString("base64") } }] } },
  ],
};

const script = [
  { speaker: "HostA", text: "First line." },
  { speaker: "HostB", text: "Second line." },
];
const voices = { HostA: "Algieba", HostB: "Aoede" };

describe("synthesizeDialogue", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("survives a chunk that fails once, rather than losing the episode", async () => {
    generateContentMock
      .mockRejectedValueOnce(new Error("429 rate limit"))
      .mockResolvedValueOnce(audioReply);

    const result = await synthesizeDialogue(script, voices, "Read it.");

    expect(generateContentMock).toHaveBeenCalledTimes(2);
    expect(result.mimeType).toBe("audio/wav");
  });

  it("gives up after three attempts, and says so in words an editor can act on", async () => {
    generateContentMock.mockRejectedValue(new Error("503 model overloaded"));

    await expect(synthesizeDialogue(script, voices, "Read it.")).rejects.toBeInstanceOf(
      TransientError,
    );
    expect(generateContentMock).toHaveBeenCalledTimes(3);
  });

  it("never leaks the model's own message, which names quota state", async () => {
    generateContentMock.mockRejectedValue(new Error("quota exceeded for project 12345"));

    await expect(synthesizeDialogue(script, voices, "Read it.")).rejects.toThrow(
      "The audio service kept refusing. Please try again.",
    );
  });
});
