/**
 * Loads the NZZ export into Firestore. Run by hand, never by the server.
 *
 *   npm run seed:articles
 *
 * The export lives outside the repository and is gitignored, which is exactly
 * why this exists: the container never reads those files. A developer runs
 * this once, and from then on every environment reads the same articles out
 * of Firestore.
 *
 * Re-running is safe. Each article is keyed on its NZZ document id, so a
 * second run overwrites the first rather than adding duplicates.
 */
import fs from "node:fs";
import path from "node:path";

import { getFirestore } from "../lib/firestore.js";
import { mapNzzToArticle } from "../lib/nzz-article-adapter.js";
import { ARTICLES_COLLECTION } from "../services/articles.js";

import type { NzzRawArticle } from "../types/nzz.js";

const DEFAULT_EXPORT_DIR = "../Data/LiquidStoryEngine/input/articles";

/**
 * Writes are chunked at this size. The current quotas page documents no
 * maximum batch size, so this is a conservative number rather than a limit
 * read from the docs. At 29 articles it never chunks; it exists so a larger
 * export later does not turn into one unbounded commit.
 */
const BATCH_SIZE = 500;

/**
 * Checks the three fields an article cannot be built without. JSON.parse
 * returns `any`, so without this the cast below would be a promise to the
 * compiler that nothing verifies, and a malformed file would reach Firestore
 * with `undefined` sitting in a field typed `string`.
 */
function assertRawArticle(value: unknown, file: string): asserts value is NzzRawArticle {
  const article = value as Partial<NzzRawArticle> | null;
  const missing = (["document_id", "headline", "published_at"] as const).filter(
    (field) => !article?.[field],
  );

  if (missing.length > 0) {
    throw new Error(`${file} is missing required field(s): ${missing.join(", ")}`);
  }
}

/**
 * Reads and converts every article in the export. One unreadable file fails
 * the whole run: a partial seed that looks successful is worse than a loud
 * failure, because the missing articles are invisible afterwards.
 */
function loadArticles(dir: string) {
  if (!fs.existsSync(dir)) {
    throw new Error(`Export directory not found: ${dir}. Set ARTICLES_DIR to override.`);
  }

  const files = fs.readdirSync(dir).filter((file) => file.endsWith(".json"));
  if (files.length === 0) {
    throw new Error(`No .json files in ${dir}`);
  }

  return files.map((file) => {
    const raw: unknown = JSON.parse(fs.readFileSync(path.join(dir, file), "utf8"));
    assertRawArticle(raw, file);
    return mapNzzToArticle(raw);
  });
}

async function seed(): Promise<void> {
  const dir = path.resolve(process.env.ARTICLES_DIR ?? DEFAULT_EXPORT_DIR);
  const articles = loadArticles(dir);
  console.log(`Read ${String(articles.length)} articles from ${dir}`);

  const db = getFirestore();
  const collection = db.collection(ARTICLES_COLLECTION);

  for (let start = 0; start < articles.length; start += BATCH_SIZE) {
    const batch = db.batch();
    for (const article of articles.slice(start, start + BATCH_SIZE)) {
      // set() replaces the whole document, so a re-run leaves no stale fields
      // from a previous version of the adapter.
      batch.set(collection.doc(article.id), article);
    }
    await batch.commit();
  }

  console.log(`Wrote ${String(articles.length)} articles to "${ARTICLES_COLLECTION}"`);
}

seed().catch((error: unknown) => {
  console.error("Seed failed:", error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
