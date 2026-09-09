import { describe, it, expect, vi, beforeEach } from "vitest";

import { generateFlexReadLayers, generatePodcastScript } from "./gemini.js";

/**
 * The model call is mocked, so these check that our prompts and parsing hold
 * without spending quota or waiting on the network.
 *
 * The mock replaces getVertexClient rather than the @google/genai SDK beneath
 * it. Mocking the SDK leaves getVertexClient running, and it throws on a
 * missing VERTEX_PROJECT before it ever constructs a client. That passed
 * locally, where backend/.env supplies one, and failed in CI, where nothing
 * does.
 *
 * vi.hoisted is what makes the mock reachable: vi.mock is lifted above the
 * imports, so a plain const declared here would not exist when the factory
 * runs.
 */
const { generateContentMock } = vi.hoisted(() => ({ generateContentMock: vi.fn() }));

vi.mock("../lib/vertex.js", () => ({
  getVertexClient: () => ({ models: { generateContent: generateContentMock } }),
}));

describe("Gemini Service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("generateFlexReadLayers parses valid JSON response", async () => {
    const mockLayers = {
      headline: "Test Headline",
      summary60s: "This is a 60-second summary.",
      keyPoints: ["Point 1", "Point 2"],
    };

    generateContentMock.mockResolvedValueOnce({ text: JSON.stringify(mockLayers) });

    const result = await generateFlexReadLayers("Mock article text");
    expect(result).toEqual(mockLayers);
    expect(generateContentMock).toHaveBeenCalledWith(
      expect.objectContaining({
        model: "gemini-2.5-flash",
        config: { responseMimeType: "application/json" },
      }),
    );
  });

  it("generatePodcastScript parses valid JSON response", async () => {
    const mockScript = [
      { speaker: "HostA", text: "Welcome to the show." },
      { speaker: "HostB", text: "Thanks for having me." },
    ];

    generateContentMock.mockResolvedValueOnce({ text: JSON.stringify(mockScript) });

    const result = await generatePodcastScript("Mock article text");
    expect(result).toEqual(mockScript);
  });

  it("returns an empty result rather than throwing when the model returns nothing", async () => {
    generateContentMock.mockResolvedValueOnce({ text: undefined });

    await expect(generateFlexReadLayers("Mock article text")).resolves.toEqual({});
    generateContentMock.mockResolvedValueOnce({ text: undefined });
    await expect(generatePodcastScript("Mock article text")).resolves.toEqual([]);
  });
});

describe("avoiding forbidden terms", () => {
  const script = (text: string) => ({ text: JSON.stringify([{ speaker: "HostA", text }]) });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("asks again when the first attempt uses a banned name, and keeps the clean one", async () => {
    generateContentMock
      .mockResolvedValueOnce(script("Roche halted the trial."))
      .mockResolvedValueOnce(script("The manufacturer halted the trial."));

    const result = await generatePodcastScript("article", {
      tone: "measured",
      avoid: ["Roche"],
    });

    expect(generateContentMock).toHaveBeenCalledTimes(2);
    expect(result).toEqual([{ speaker: "HostA", text: "The manufacturer halted the trial." }]);
  });

  it("refuses rather than shipping audio that breaks the rule twice", async () => {
    generateContentMock.mockResolvedValue(script("Roche halted the trial."));

    await expect(
      generatePodcastScript("article", { tone: "measured", avoid: ["Roche"] }),
    ).rejects.toThrow("The script kept using: Roche");

    expect(generateContentMock).toHaveBeenCalledTimes(2);
  });

  it("spends one call and no check when nothing is banned", async () => {
    generateContentMock.mockResolvedValue(script("Roche halted the trial."));

    const result = await generatePodcastScript("article");

    expect(generateContentMock).toHaveBeenCalledTimes(1);
    expect(result).toEqual([{ speaker: "HostA", text: "Roche halted the trial." }]);
  });

  it("leaves the show-notes prompt untouched, since that caller sends no controls", async () => {
    generateContentMock.mockResolvedValue({ text: JSON.stringify({ summary60s: "Anything." }) });

    // routes/flexread.ts calls this with one argument for show notes. Only the
    // briefing passes controls, so this path must keep generating what it did.
    await generateFlexReadLayers("article");

    const contents: unknown = generateContentMock.mock.calls[0]?.[0]?.contents;
    expect(generateContentMock).toHaveBeenCalledTimes(1);
    expect(contents).toContain("Keep an even, analytical register.");
    expect(contents).not.toContain("Do not use any of these words");
  });

  it("leaves the prompt untouched when no controls are sent", async () => {
    generateContentMock.mockResolvedValue(script("Anything."));

    await generatePodcastScript("article");

    // Optional chaining because noUncheckedIndexedAccess types an array index
    // as possibly undefined, and the assertion below is what proves it is not.
    const contents: unknown = generateContentMock.mock.calls[0]?.[0]?.contents;
    expect(contents).toContain("Keep an even, analytical register.");
    expect(contents).not.toContain("Do not use any of these words");
  });
});
