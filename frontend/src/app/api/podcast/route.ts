import { NextResponse } from "next/server";

import { articleToText } from "@/lib/article-text";
import { BackendError, postToBackend } from "@/lib/backend";
import { getServerArticleById } from "@/lib/server-articles";

/**
 * Proxies script generation to the Express backend. The browser posts an
 * article id, never article text: the article is re-read from the server's own
 * source so a client cannot substitute its own content into a paid model call.
 */

interface BackendScript {
  script: { speaker: string; text: string }[];
}

export async function POST(request: Request) {
  const body: unknown = await request.json().catch(() => null);
  const articleId = (body as { articleId?: unknown })?.articleId;

  if (typeof articleId !== "string" || articleId.trim() === "") {
    return NextResponse.json({ error: "articleId must be a non-empty string" }, { status: 400 });
  }

  const article = getServerArticleById(articleId);
  if (!article) {
    return NextResponse.json({ error: "Article not found" }, { status: 404 });
  }

  try {
    const { script } = await postToBackend<BackendScript>("/api/podcast", {
      articleText: articleToText(article),
    });
    return NextResponse.json({ script });
  } catch (error) {
    if (error instanceof BackendError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    // An unreachable backend lands here: fetch throws before any status exists.
    console.error("Podcast proxy error:", error);
    return NextResponse.json({ error: "Could not reach the generation service" }, { status: 502 });
  }
}
