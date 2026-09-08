import { NextResponse } from "next/server";

import { loadServerArticles } from "@/lib/server-articles";

export async function GET() {
  const articles = loadServerArticles();
  const summaries = articles.map((article) => ({
    id: article.id,
    kicker: article.kicker,
    title: article.title,
    subtitle: article.subtitle,
    author: article.author,
    publishedAt: article.publishedAt,
    readTimeMinutes: article.readTimeMinutes,
    wordCount: article.wordCount,
    heroImage: article.heroImage,
    tags: article.tags,
  }));

  return NextResponse.json(summaries);
}
