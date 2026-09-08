import { Article, ArticleSection, NzzRawArticle } from "@/types/article";

export const mapNzzToArticle = (raw: NzzRawArticle): Article => {
  const sections: ArticleSection[] = [];

  if (raw.lead) {
    sections.push({
      id: "sec-lead",
      type: "lead",
      content: raw.lead,
    });
  }

  if (raw.summary_bullets_en && raw.summary_bullets_en.length > 0) {
    sections.push({
      id: "sec-bullets",
      type: "key-points",
      content: "Key Takeaways",
      items: raw.summary_bullets_en,
    });
  }

  if (Array.isArray(raw.body)) {
    raw.body.forEach((item, idx) => {
      const id = `sec-${idx}`;
      if (item.type === "paragraph" && item.text) {
        sections.push({ id, type: "paragraph", content: item.text });
      } else if (item.type === "heading" && item.text) {
        sections.push({ id, type: "heading", content: item.text });
      } else if (item.type === "image" && item.url) {
        sections.push({
          id,
          type: "image",
          content: item.caption || "",
          imageUrl: item.url,
          imageCaption: item.caption,
        });
      } else if (item.type === "quote" && item.text) {
        sections.push({
          id,
          type: "quote",
          content: item.text,
          quoteAuthor: item.author,
        });
      } else if (item.type === "question" && item.text) {
        sections.push({ id, type: "question", content: item.text });
      } else if (item.type === "answer" && item.text) {
        sections.push({ id, type: "answer", content: item.text });
      } else if (item.type === "infobox" && (item.text || item.title)) {
        sections.push({
          id,
          type: "infobox",
          content: item.text || item.title || "",
        });
      }
    });
  }

  const readMins = raw.reading_time_seconds
    ? Math.max(1, Math.round(raw.reading_time_seconds / 60))
    : 5;

  const authorName =
    raw.author_line ||
    (raw.authors && raw.authors.length > 0 ? raw.authors.join(", ") : "NZZ Editorial");

  const cleanTags = (raw.tags || [])
    .filter((t) => !t.includes("="))
    .concat(raw.section ? [raw.section.toLowerCase()] : []);

  return {
    id: String(raw.document_id || raw.nzz_id || Date.now()),
    title: raw.headline || "Untitled Article",
    subtitle: raw.lead || "",
    kicker: raw.section || "Dispatch",
    author: {
      name: authorName,
      role: raw.section ? `NZZ ${raw.section}` : "NZZ Correspondent",
    },
    publishedAt: raw.published_at || new Date().toISOString(),
    sourceUrl: raw.url,
    readTimeMinutes: readMins,
    wordCount: raw.word_count || 1200,
    heroImage: {
      url:
        raw.teaser_image?.url ||
        "https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=1200&auto=format&fit=crop&q=80",
      caption: raw.teaser_image?.caption || raw.headline,
      credit: raw.teaser_image?.credit,
    },
    sections,
    tags: Array.from(new Set(cleanTags)),
    summaryBullets: raw.summary_bullets_en,
  };
};
