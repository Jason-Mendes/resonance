import { NextResponse } from "next/server";

import { articleToText } from "@/lib/article-text";
import { BackendError, postToBackend } from "@/lib/backend";
import { getServerArticleById } from "@/lib/server-articles";

/**
 * Starts a briefing render: article in, roughly sixty seconds of single-voice
 * audio out. Takes an article id and re-reads the article server-side, like
 * the script route, since nothing here needs text from the browser.
 */

interface JobAccepted {
  jobId: string;
  status: string;
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
    const job = await postToBackend<JobAccepted>("/api/briefing", {
      articleText: articleToText(article),
    });
    return NextResponse.json(job, { status: 202 });
  } catch (error) {
    if (error instanceof BackendError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error("Briefing proxy error:", error);
    return NextResponse.json({ error: "Could not reach the audio service" }, { status: 502 });
  }
}
