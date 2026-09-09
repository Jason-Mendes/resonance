import { Router } from "express";

import { parseArticleDraft } from "../lib/article-draft.js";
import { createArticle, getArticleById, listArticleSummaries } from "../services/articles.js";

export const articlesRouter = Router();

/**
 * Two shapes of id reach this route: NZZ document ids, which are digits, and
 * "ed-<uuid>" for articles typed into the app. Both are letters, digits and
 * hyphens, so anything else is refused before it reaches Firestore, where an
 * id containing a slash is read as a document path and would address
 * something other than an article.
 */
const ARTICLE_ID_PATTERN = /^[A-Za-z0-9-]{1,64}$/;

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

articlesRouter.post("/", async (req, res) => {
  const parsed = parseArticleDraft(req.body);
  if (!parsed.ok) {
    return res.status(400).json({ error: parsed.error });
  }

  try {
    const article = await createArticle(parsed.draft);
    // 201 with the stored article, so the caller gets the server-assigned id
    // and the parsed sections without a second request.
    res.status(201).location(`/api/articles/${article.id}`).json(article);
  } catch (error) {
    console.error("Article create error:", error);
    res.status(500).json({ error: "Could not save the article" });
  }
});

articlesRouter.get("/:id", async (req, res) => {
  const id = req.params.id;
  if (!id || !ARTICLE_ID_PATTERN.test(id)) {
    return res.status(400).json({ error: "That is not a valid article id" });
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
