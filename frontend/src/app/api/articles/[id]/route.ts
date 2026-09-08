import { NextResponse } from "next/server";

import { getServerArticleById } from "@/lib/server-articles";

interface RouteParams {
  params: {
    id: string;
  };
}

export async function GET(_request: Request, { params }: RouteParams) {
  const article = getServerArticleById(params.id);

  if (!article) {
    return NextResponse.json({ error: "Article not found" }, { status: 404 });
  }

  return NextResponse.json(article);
}
