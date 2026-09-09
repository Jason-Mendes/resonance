import { describe, it, expect } from "vitest";

import { applyDraftToArticle } from "./article-draft.js";

import type { Article } from "../types/article.js";

const nzzArticle: Article = {
  id: "1234567",
  title: "When crude oil enters the sea off Oman",
  subtitle: "A standfirst",
  kicker: "Wissenschaft",
  author: { name: "A Correspondent", role: "NZZ Wissenschaft" },
  publishedAt: "2024-03-01T00:00:00.000Z",
  sourceUrl: "https://www.nzz.ch/some-article",
  readTimeMinutes: 7,
  wordCount: 900,
  heroImage: { url: "https://img.nzz.ch/hero.jpg", caption: "Sohar, 2019", credit: "Reuters" },
  sections: [{ id: "s-0", type: "image", content: "", imageUrl: "https://img.nzz.ch/a.jpg" }],
  tags: ["oman", "oil"],
  summaryBullets: ["A supertanker is leaking off Oman.", "Life proves surprisingly resilient."],
};

const editOf = (article: Article) => ({
  title: "A corrected headline",
  body: "The standfirst.\n\n## A heading\n\nA paragraph.",
  authorName: article.author.name,
  heroImageUrl: article.heroImage?.url ?? "",
});

describe("applyDraftToArticle", () => {
  it("keeps the fields the editor form never collected", () => {
    const updated = applyDraftToArticle(nzzArticle, editOf(nzzArticle));

    expect(updated.id).toBe(nzzArticle.id);
    expect(updated.publishedAt).toBe(nzzArticle.publishedAt);
    expect(updated.sourceUrl).toBe(nzzArticle.sourceUrl);
    expect(updated.tags).toEqual(nzzArticle.tags);
    expect(updated.author.role).toBe("NZZ Wissenschaft");
  });

  it("keeps the caption and credit when the hero image is unchanged", () => {
    const updated = applyDraftToArticle(nzzArticle, editOf(nzzArticle));

    expect(updated.heroImage).toEqual(nzzArticle.heroImage);
  });

  it("takes the caption from the headline once the hero image is replaced", () => {
    const draft = { ...editOf(nzzArticle), heroImageUrl: "https://img.nzz.ch/other.jpg" };
    const updated = applyDraftToArticle(nzzArticle, draft);

    expect(updated.heroImage).toEqual({
      url: "https://img.nzz.ch/other.jpg",
      caption: "A corrected headline",
    });
  });

  it("drops the hero image when the editor clears the field", () => {
    const updated = applyDraftToArticle(nzzArticle, { ...editOf(nzzArticle), heroImageUrl: "" });

    expect(updated.heroImage).toBeUndefined();
  });

  // Accepted loss, not an oversight: the form edits one plain-text body, and
  // nothing in that text can express a photograph. An editor is warned in the
  // UI before they save an article whose sections cannot survive the trip.
  it("rebuilds the body from the draft, so image sections do not survive", () => {
    const updated = applyDraftToArticle(nzzArticle, editOf(nzzArticle));

    expect(updated.sections.map((section) => section.type)).toEqual([
      "lead",
      "heading",
      "paragraph",
    ]);
  });

  it("keeps the summary bullets, which no field in the form collects", () => {
    const updated = applyDraftToArticle(nzzArticle, editOf(nzzArticle));

    expect(updated.summaryBullets).toEqual(nzzArticle.summaryBullets);
  });
});
