import { NextResponse } from "next/server";

import { articleToText } from "@/lib/article-text";
import { fetchArticle } from "@/lib/articles";
import { BackendError, postToBackend } from "@/lib/backend";

/**
 * Layered reading of an article: a headline, a sixty-second summary and key
 * points. Fast enough to await directly, unlike the audio routes, since no
 * speech is synthesised.
 */

interface FlexReadLayers {
  headline?: string;
  summary60s?: string;
  keyPoints?: string[];
}

export async function POST(request: Request) {
  const body: unknown = await request.json().catch(() => null);
  const articleId = (body as { articleId?: unknown })?.articleId;

  if (typeof articleId !== "string" || articleId.trim() === "") {
    return NextResponse.json({ error: "articleId must be a non-empty string" }, { status: 400 });
  }

  try {
    const article = await fetchArticle(articleId);
    if (!article) {
      return NextResponse.json({ error: "Article not found" }, { status: 404 });
    }

    const layers = await postToBackend<FlexReadLayers>("/api/flexread", {
      articleText: articleToText(article),
    });
    // fullText comes back too and is the article we already hold, so it is
    // dropped rather than sent to the browser a second time.
    return NextResponse.json({
      headline: layers.headline ?? "",
      summary60s: layers.summary60s ?? "",
      keyPoints: Array.isArray(layers.keyPoints) ? layers.keyPoints : [],
    });
  } catch (error) {
    if (error instanceof BackendError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error("FlexRead proxy error:", error);
    return NextResponse.json({ error: "Could not reach the reading service" }, { status: 502 });
  }
}
