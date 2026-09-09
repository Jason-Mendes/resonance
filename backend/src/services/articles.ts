/**
 * Reads NZZ articles out of Firestore.
 *
 * Writing is not here: articles arrive through `scripts/seed-articles.ts`,
 * run by hand. Nothing on the request path creates or modifies an article.
 */
import { getFirestore } from "../lib/firestore.js";

import type { Article, ArticleSummary } from "../types/article.js";

export const ARTICLES_COLLECTION = "articles";

/**
 * The fields the list view needs. Named explicitly so Firestore returns only
 * these: the bodies are the bulk of the data and the card grid never shows
 * them, so fetching all 29 in full would move roughly 1.6 MB to render a grid.
 */
const SUMMARY_FIELDS: readonly (keyof ArticleSummary)[] = [
  "id",
  "title",
  "subtitle",
  "kicker",
  "author",
  "publishedAt",
  "readTimeMinutes",
  "wordCount",
  "heroImage",
  "tags",
];

/** Newest first, which is the order the card grid shows them in. */
export async function listArticleSummaries(): Promise<ArticleSummary[]> {
  const snapshot = await getFirestore()
    .collection(ARTICLES_COLLECTION)
    .orderBy("publishedAt", "desc")
    .select(...SUMMARY_FIELDS)
    .get();

  return snapshot.docs.map((doc) => doc.data() as ArticleSummary);
}

/** Null when no article carries that id, which the route turns into a 404. */
export async function getArticleById(id: string): Promise<Article | null> {
  const doc = await getFirestore().collection(ARTICLES_COLLECTION).doc(id).get();
  return doc.exists ? (doc.data() as Article) : null;
}
