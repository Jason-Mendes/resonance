export const QUERY_KEYS = {
  articles: ["articles"] as const,
  article: (id: string) => ["articles", id] as const,
} as const;
