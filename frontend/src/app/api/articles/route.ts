import { NextResponse } from "next/server";

import { BackendError, getFromBackend, postToBackend } from "@/lib/backend";
import { Article, ArticleSummary } from "@/types/article";

/**
 * Articles live in Firestore and are read by the backend. This forwards, so
 * the browser still only ever talks to this app's own origin.
 */

export async function GET() {
  try {
    const summaries = await getFromBackend<ArticleSummary[]>("/api/articles");
    return NextResponse.json(summaries);
  } catch (error) {
    if (error instanceof BackendError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error("Article list proxy error:", error);
    return NextResponse.json({ error: "Could not reach the article service" }, { status: 502 });
  }
}

/**
 * Saves an article an editor typed in. The body is passed through untouched:
 * the backend validates it and decides the id, so this adds no rules of its
 * own that could drift out of step with the ones that matter.
 */
export async function POST(request: Request) {
  const body: unknown = await request.json().catch(() => null);

  try {
    const article = await postToBackend<Article>("/api/articles", body);
    return NextResponse.json(article, { status: 201 });
  } catch (error) {
    if (error instanceof BackendError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error("Article create proxy error:", error);
    return NextResponse.json({ error: "Could not reach the article service" }, { status: 502 });
  }
}
