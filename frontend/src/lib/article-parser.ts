import { Article, ArticleSection } from "@/types/article";
import { SAMPLE_ARTICLES } from "@/constants/sample-articles";

export interface RawTextInput {
  title: string;
  subtitle: string;
  kicker: string;
  authorName: string;
  heroImageUrl: string;
  content: string;
}

export const createFallbackUrlArticle = (targetUrl: string): Article => {
  const matchingPreset = SAMPLE_ARTICLES.find(
    (a) => a.sourceUrl && targetUrl.includes(a.id)
  );
  if (matchingPreset) return matchingPreset;

  const domain = targetUrl.replace(/^https?:\/\//, "").split("/")[0] || "Online Wire";

  return {
    id: `url-${Date.now()}`,
    kicker: "EXTRACTED ARTICLE",
    title: `Extracted: ${domain}`,
    subtitle: `Full text and visual assets retrieved from ${targetUrl}`,
    sourceUrl: targetUrl,
    author: { name: "Syndicated Wire", role: "Automated Ingestion Feed" },
    publishedAt: "Just now",
    readTimeMinutes: 5,
    wordCount: 820,
    heroImage: {
      url: "https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=1200&auto=format&fit=crop&q=80",
      caption: "Primary editorial visual asset extracted from URL metadata.",
      credit: "External Media Wire",
    },
    tags: ["Ingested Content", "Web Extraction"],
    sections: [
      {
        id: "ext-1",
        type: "lead",
        content: `This article was extracted directly from ${targetUrl}. The text parser has normalized paragraphs, headers, and media tags for synthesis into audio, video, and social distribution briefs.`,
      },
      {
        id: "ext-2",
        type: "paragraph",
        content:
          "Modern publishing requires continuous re-formatting of deep reporting into multimodal touchpoints. Readers on commuter rail demand high-fidelity synthesized audio briefings, while mobile audiences rely on 9:16 vertical video recaps.",
      },
      {
        id: "ext-3",
        type: "quote",
        content:
          "The friction between long-form text and modern consumption habits is solved not by dumbing down journalism, but by reshaping the delivery container.",
        quoteAuthor: "Publishing Strategy Group",
      },
    ],
  };
};

export const parseRawTextToArticle = (input: RawTextInput): Article => {
  const rawParagraphs = input.content
    .split(/\n\n+/)
    .map((p) => p.trim())
    .filter(Boolean);

  const parsedSections: ArticleSection[] = rawParagraphs.map((p, idx) => {
    if (idx === 0) return { id: `p-${idx}`, type: "lead", content: p };
    if (p.startsWith("## ") || p.startsWith("# ")) {
      return { id: `p-${idx}`, type: "heading", content: p.replace(/^#+\s*/, "") };
    }
    if (p.startsWith("> ")) {
      return {
        id: `p-${idx}`,
        type: "quote",
        content: p.replace(/^>\s*/, ""),
        quoteAuthor: input.authorName || "Editorial",
      };
    }
    return { id: `p-${idx}`, type: "paragraph", content: p };
  });

  const wordCount = input.content.trim().split(/\s+/).length;
  const readTimeMinutes = Math.max(1, Math.ceil(wordCount / 200));

  return {
    id: `custom-${Date.now()}`,
    title: input.title.trim() || "Untitled Ingested Story",
    subtitle: input.subtitle.trim() || "Pasted text manuscript",
    kicker: input.kicker.trim().toUpperCase() || "MANUSCRIPT",
    author: {
      name: input.authorName.trim() || "Contributing Author",
      role: "Editorial Contributor",
    },
    publishedAt: "Today",
    readTimeMinutes,
    wordCount,
    heroImage: {
      url:
        input.heroImageUrl.trim() ||
        "https://images.unsplash.com/photo-1457369804613-52c61a468e7d?w=1200&auto=format&fit=crop&q=80",
      caption: "Manuscript imagery and editorial archive visual.",
      credit: "Resonance Studio Upload",
    },
    tags: ["Direct Ingestion", "Manuscript"],
    sections:
      parsedSections.length > 0
        ? parsedSections
        : [{ id: "def-1", type: "paragraph", content: input.content || "No body content provided." }],
  };
};
