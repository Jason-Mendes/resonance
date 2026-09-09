import { NextResponse } from "next/server";

import { articleToText } from "@/lib/article-text";
import { fetchArticle } from "@/lib/articles";
import { BackendError, postToBackend } from "@/lib/backend";
import { collectSocialImages } from "@/lib/social-images";
import { SocialCarousel } from "@/types/social";

/**
 * A social carousel for one article. The browser sends an id and nothing else,
 * so the text and the photographs are read from the article record here rather
 * than trusted from the client.
 */
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

    const images = collectSocialImages(article);
    if (images.length === 0) {
      return NextResponse.json(
        { error: "This article has no photographs to build a carousel from" },
        { status: 422 },
      );
    }

    const carousel = await postToBackend<SocialCarousel>("/api/social", {
      articleText: articleToText(article),
      imageCaptions: images.map((image) => image.caption),
      tags: article.tags,
    });

    // The backend returns one caption per photograph, in the order they were
    // sent, so index is the whole pairing. It guarantees the count matches.
    return NextResponse.json({
      intro: carousel.intro,
      hashtags: carousel.hashtags,
      slides: carousel.slides.map((slide, index) => ({ ...slide, image: images[index] })),
    });
  } catch (error) {
    if (error instanceof BackendError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error("Social proxy error:", error);
    return NextResponse.json({ error: "Could not reach the social service" }, { status: 502 });
  }
}
