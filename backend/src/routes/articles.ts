import { Router } from "express";

import { getArticleById, listArticleSummaries } from "../services/articles.js";

export const articlesRouter = Router();

/**
 * Article ids are NZZ document ids, which are digits only. Validated before
 * the value reaches Firestore, where an id containing slashes is read as a
 * document path and would address something other than an article.
 */
const ARTICLE_ID_PATTERN = /^\d+$/;

articlesRouter.get("/", async (_req, res) => {
  try {
    res.json(await listArticleSummaries());
  } catch (error) {
    // Detail stays server-side: Firestore errors can name the project and
    // database, neither of which belongs in a response.
    console.error("Article list error:", error);
    res.status(500).json({ error: "Could not load articles" });
  }
});

articlesRouter.get("/:id", async (req, res) => {
  const id = req.params.id;
  if (!id || !ARTICLE_ID_PATTERN.test(id)) {
    return res.status(400).json({ error: "An article id must be a number" });
  }

  try {
    const article = await getArticleById(id);
    if (!article) {
      return res.status(404).json({ error: "Article not found" });
    }
    res.json(article);
  } catch (error) {
    console.error("Article fetch error:", error);
    res.status(500).json({ error: "Could not load article" });
  }
});
