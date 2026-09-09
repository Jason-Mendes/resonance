/**
 * Reads and creates articles in Firestore.
 *
 * Articles arrive two ways. The 29 NZZ ones are loaded by
 * `scripts/seed-articles.ts`, run by hand, and keep their numeric document
 * ids. Ones an editor types in are created here and get an "ed-" id. Either
 * kind can then be edited in place, which rewrites the stored document.
 * Nothing deletes one.
 */
import { randomUUID } from "node:crypto";

import { applyDraftToArticle, draftToArticle } from "../lib/article-draft.js";
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

/**
 * Rewrites a stored article from an edited draft, or null if no article
 * carries that id, which the route turns into a 404.
 *
 * The transaction makes the read and the write one step, so the fields the
 * form never collected are copied from the document as it stands at write
 * time rather than from a snapshot that may already be stale.
 *
 * It is not conflict detection. Fields the form does edit come from the draft,
 * so of two editors saving at once the second overwrites the first's headline
 * and body. Catching that needs a version on the document and a refusal the
 * editor can see.
 */
export async function updateArticle(id: string, draft: ArticleDraft): Promise<Article | null> {
  const ref = getFirestore().collection(ARTICLES_COLLECTION).doc(id);

  return getFirestore().runTransaction(async (transaction) => {
    const snapshot = await transaction.get(ref);
    if (!snapshot.exists) return null;

    const updated = applyDraftToArticle(snapshot.data() as Article, draft);
    // set() rather than update(): the sections array is replaced wholesale,
    // and a merge would leave sections from the old body behind.
    transaction.set(ref, updated);
    return updated;
  });
}
