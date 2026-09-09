/**
 * Reads and creates articles in Firestore.
 *
 * Articles arrive two ways. The 29 NZZ ones are loaded by
 * `scripts/seed-articles.ts`, run by hand, and keep their numeric document
 * ids. Ones an editor types in are created here and get an "ed-" id. Nothing
 * modifies or deletes an existing article.
 */
import { randomUUID } from "node:crypto";

import { draftToArticle } from "../lib/article-draft.js";
import { getFirestore } from "../lib/firestore.js";

import type { ArticleDraft } from "../lib/article-draft.js";
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

/**
 * Stores an article an editor typed in and returns it with its new id.
 *
 * The id is generated here, never taken from the request. NZZ articles are
 * keyed on their numeric document id, so the "ed-" prefix also makes the two
 * sources tellable apart in the database.
 */
export async function createArticle(draft: ArticleDraft): Promise<Article> {
  const id = `ed-${randomUUID()}`;
  const article = draftToArticle(draft, id);

  // create() rather than set(): it fails if the document already exists,
  // so a generated id can never quietly overwrite a stored article.
  await getFirestore().collection(ARTICLES_COLLECTION).doc(id).create(article);
  return article;
}

/** Null when no article carries that id, which the route turns into a 404. */
export async function getArticleById(id: string): Promise<Article | null> {
  const doc = await getFirestore().collection(ARTICLES_COLLECTION).doc(id).get();
  return doc.exists ? (doc.data() as Article) : null;
}
