import { useState, useEffect, useCallback } from "react";

const STORAGE_KEY = "resonance_synthesized_articles";
const TOPICS_STORAGE_KEY = "resonance_synthesized_topics";
const EVENT_KEY = "resonance:synthesized-updated";

const readStoredIds = (): string[] => {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
};

const readStoredTopics = (): Record<string, string> => {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(TOPICS_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Record<string, string>) : {};
  } catch {
    return {};
  }
};

export const markArticleSynthesized = (articleId: string, topic?: string): void => {
  if (typeof window === "undefined" || !articleId) return;
  try {
    const current = readStoredIds();
    if (!current.includes(articleId)) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify([...current, articleId]));
    }
    if (topic) {
      const currentTopics = readStoredTopics();
      currentTopics[articleId] = topic;
      localStorage.setItem(TOPICS_STORAGE_KEY, JSON.stringify(currentTopics));
    }
    window.dispatchEvent(new Event(EVENT_KEY));
  } catch {
    // Ignore storage quota or disabled errors
  }
};

const unmarkStoredArticle = (id: string): void => {
  if (typeof window === "undefined" || !id) return;
  try {
    const nextIds = readStoredIds().filter((item) => item !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(nextIds));
    const nextTopics = readStoredTopics();
    delete nextTopics[id];
    localStorage.setItem(TOPICS_STORAGE_KEY, JSON.stringify(nextTopics));
    window.dispatchEvent(new Event(EVENT_KEY));
  } catch {
    // Ignore storage errors
  }
};

const useStorageState = () => {
  const [synthesizedIds, setSynthesizedIds] = useState<string[]>([]);
  const [topics, setTopics] = useState<Record<string, string>>({});

  useEffect(() => {
    const load = () => {
      setSynthesizedIds(readStoredIds());
      setTopics(readStoredTopics());
    };
    load();

    window.addEventListener(EVENT_KEY, load);
    window.addEventListener("storage", load);
    return () => {
      window.removeEventListener(EVENT_KEY, load);
      window.removeEventListener("storage", load);
    };
  }, []);

  return { synthesizedIds, topics };
};

export const useSynthesizedArticles = () => {
  const { synthesizedIds, topics } = useStorageState();

  const markSynthesized = useCallback((id: string, topic?: string) => {
    markArticleSynthesized(id, topic);
  }, []);

  const unmarkSynthesized = useCallback((id: string) => {
    unmarkStoredArticle(id);
  }, []);

  const isSynthesized = useCallback((id: string) => synthesizedIds.includes(id), [synthesizedIds]);

  const getTopic = useCallback((id: string): string | undefined => topics[id], [topics]);

  const availableTopics = Array.from(
    new Set(Object.values(topics).filter((t): t is string => Boolean(t))),
  ).sort();

  return {
    synthesizedIds,
    synthesizedCount: synthesizedIds.length,
    topics,
    availableTopics,
    getTopic,
    isSynthesized,
    markSynthesized,
    unmarkSynthesized,
  };
};
