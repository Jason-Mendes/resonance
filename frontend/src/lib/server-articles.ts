import fs from "fs";
import path from "path";

import { SAMPLE_ARTICLES } from "@/constants/sample-articles";
import { mapNzzToArticle } from "@/lib/nzz-article-adapter";
import { Article, NzzRawArticle } from "@/types/article";

let cachedArticles: Article[] | null = null;

export const loadServerArticles = (): Article[] => {
  if (cachedArticles) {
    return cachedArticles;
  }

  try {
    const dir = path.resolve(process.cwd(), "..", "LiquidStoryEngine", "input", "articles");
    if (fs.existsSync(dir)) {
      const files = fs.readdirSync(dir).filter((f) => f.endsWith(".json"));
      const parsed: Article[] = [];

      for (const file of files) {
        try {
          const rawContent = fs.readFileSync(path.join(dir, file), "utf8");
          const rawJson: NzzRawArticle = JSON.parse(rawContent);
          parsed.push(mapNzzToArticle(rawJson));
        } catch {
          // ignore corrupted file
        }
      }

      if (parsed.length > 0) {
        parsed.sort(
          (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
        );
        cachedArticles = parsed;
        return cachedArticles;
      }
    }
  } catch {
    // fallback if file system access fails
  }

  cachedArticles = SAMPLE_ARTICLES;
  return cachedArticles;
};

export const getServerArticleById = (id: string): Article | null => {
  const articles = loadServerArticles();
  return (
    articles.find(
      (a) => a.id === id || a.id === String(id) || (a.sourceUrl && a.sourceUrl.includes(id)),
    ) || null
  );
};
