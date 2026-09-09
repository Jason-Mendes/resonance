import { describe, it, expect, vi, beforeEach } from "vitest";

import { generateFlexReadLayers, generatePodcastScript } from "./gemini.js";

/**
 * The model call is mocked, so these check that our prompts and parsing hold
 * without spending quota or waiting on the network.
 *
 * vi.hoisted is what makes the mock reachable. vi.mock is lifted above the
 * imports, so a plain const declared here would not exist yet when the factory
 * runs. Reading the mock back off the mocked module instead would mean
 * importing a name @google/genai does not export, which type-checks as an
 * error even though the test passes.
 */
const { generateContentMock } = vi.hoisted(() => ({ generateContentMock: vi.fn() }));

vi.mock("@google/genai", () => ({
  GoogleGenAI: class {
    models = { generateContent: generateContentMock };
  },
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
