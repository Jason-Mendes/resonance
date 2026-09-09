import { describe, it, expect } from "vitest";

import { findForbiddenTerms, parseGenerationControls } from "./generation-controls.js";

describe("findForbiddenTerms", () => {
  it("finds a term the script actually says", () => {
    const script = "Roche said the trial was halted.";

    expect(findForbiddenTerms(script, ["Roche"])).toEqual(["Roche"]);
  });

  it("matches a word inside ordinary punctuation", () => {
    const script = "Roche's results, published Tuesday, were thin.";

    expect(findForbiddenTerms(script, ["roche"])).toEqual(["roche"]);
  });

  it("does not trip on a term that is only a fragment of another word", () => {
    const script = "The minister said the report was ready.";

    expect(findForbiddenTerms(script, ["AI"])).toEqual([]);
  });

  it("matches a phrase across the space in the middle of it", () => {
    const script = "Zurich is trialling a four-day week this autumn.";

    expect(findForbiddenTerms(script, ["four day week"])).toEqual(["four day week"]);
  });

  it("reports every term that appears, so the editor sees all of them at once", () => {
    const script = "Roche and Novartis both declined to comment.";

    expect(findForbiddenTerms(script, ["Roche", "Basel", "Novartis"])).toEqual([
      "Roche",
      "Novartis",
    ]);
  });
});

describe("parseGenerationControls", () => {
  it("defaults to today's behaviour when the caller sends nothing", () => {
    const parsed = parseGenerationControls({});

    expect(parsed).toEqual({ ok: true, controls: { tone: "measured", avoid: [] } });
  });

  it("rejects a tone that is not one of the presets", () => {
    const parsed = parseGenerationControls({ tone: "sarcastic" });

    expect(parsed.ok).toBe(false);
  });
});
