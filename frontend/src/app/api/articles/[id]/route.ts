import { NextResponse } from "next/server";

import { BackendError, getFromBackend } from "@/lib/backend";
import { Article } from "@/types/article";

interface RouteParams {
  params: {
    id: string;
  };
}

export async function GET(_request: Request, { params }: RouteParams) {
  try {
    // Encoded because it is being built into a URL path. The backend refuses
    // anything but letters, digits and hyphens, so this is belt and braces.
    const article = await getFromBackend<Article>(`/api/articles/${encodeURIComponent(params.id)}`);
    return NextResponse.json(article);
  } catch (error) {
    // A 404 from the backend means no such article, which is the caller's
    // answer rather than a fault, so it is passed through as-is.
    if (error instanceof BackendError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error("Article proxy error:", error);
    return NextResponse.json({ error: "Could not reach the article service" }, { status: 502 });
  }
}
