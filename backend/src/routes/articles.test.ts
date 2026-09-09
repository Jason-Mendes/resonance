import express from "express";
import request from "supertest";
import { describe, it, expect, vi } from "vitest";

import * as articlesService from "../services/articles.js";

import { articlesRouter } from "./articles.js";

import type { Article } from "../types/article.js";

const app = express();
app.use(express.json());
app.use("/api/articles", articlesRouter);

describe("PUT /api/articles/:id", () => {
  it("refuses an id Firestore would read as a document path", async () => {
    const res = await request(app).put("/api/articles/one%2Ftwo").send({ title: "T", body: "B" });

    expect(res.status).toBe(400);
  });

  it("refuses a draft that fails validation", async () => {
    const res = await request(app).put("/api/articles/123").send({ title: "", body: "" });

    expect(res.status).toBe(400);
  });
});

const stored: Article = {
  id: "123",
  title: "Old headline",
  subtitle: "",
  kicker: "Wissenschaft",
  author: { name: "A Correspondent", role: "NZZ Wissenschaft" },
  publishedAt: "2024-03-01T00:00:00.000Z",
  readTimeMinutes: 7,
  wordCount: 900,
  sections: [],
  tags: ["oman", "oil"],
};

describe("PUT /api/articles/:id keeps what the form never collected", () => {
  it("returns 404 when no article carries that id", async () => {
    vi.spyOn(articlesService, "updateArticle").mockResolvedValueOnce(null);

    const res = await request(app).put("/api/articles/999").send({ title: "T", body: "B" });

    expect(res.status).toBe(404);
  });

  it("passes the parsed draft to the service and returns what was stored", async () => {
    const spy = vi.spyOn(articlesService, "updateArticle").mockResolvedValueOnce(stored);

    const res = await request(app)
      .put("/api/articles/123")
      .send({ title: "  New headline  ", body: "First block\n\nSecond block" });

    expect(res.status).toBe(200);
    expect(res.body).toEqual(stored);
    expect(spy).toHaveBeenCalledWith("123", {
      title: "New headline",
      body: "First block\n\nSecond block",
    });
  });
});
