import { useCallback, useState } from "react";
import { Article, ArticleInputMode } from "@/types/article";
import { SAMPLE_ARTICLES } from "@/constants/sample-articles";
import {
  RawTextInput,
  createFallbackUrlArticle,
  parseRawTextToArticle,
} from "@/lib/article-parser";

const URL_FETCH_DELAY_MS = 700;
const TEXT_PARSE_DELAY_MS = 400;

const DEFAULT_TEXT_STATE: RawTextInput = {
  title: "",
  subtitle: "",
  kicker: "ANALYSIS",
  authorName: "Editorial Staff",
  heroImageUrl: "",
  content: "",
};

const SAMPLE_TEXT_STATE: RawTextInput = {
  kicker: "POLICY DISPATCH",
  title: "The Distributed Grid: Decentralizing Power in the Alpine Corridors",
  subtitle:
    "Microgrids and battery buffers are transforming how valley communities protect themselves from continental power outages.",
  authorName: "Sarah Lindner",
  heroImageUrl:
    "https://images.unsplash.com/photo-1509391365360-2e959784a276?w=1200&auto=format&fit=crop&q=80",
  content:
    "## The Resilience Imperative\n\nWhen severe storms knocked out regional transmission towers last November, three valleys remained fully powered. Their secret lay in autonomous microgrids coupled to small-scale hydro turbines and local storage.\n\n> Decentralization is no longer an environmental luxury; it is the fundamental prerequisite of civil resilience.\n\n## Community-Scale Storage\n\nBy pooling solar rooftops and small battery units, municipalities have created localized virtual power plants capable of islanding from the European synchronous grid in less than 20 milliseconds.",
};

/** Stands in for the real extraction API until the backend is wired up. */
const useDelayedArticleLoad = (
  onArticleLoaded: (article: Article) => void
) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const loadWithDelay = useCallback(
    (delayMs: number, build: () => Article) => {
      setIsLoading(true);
      setError(null);
      setTimeout(() => {
        setIsLoading(false);
        onArticleLoaded(build());
      }, delayMs);
    },
    [onArticleLoaded]
  );

  return { isLoading, error, setError, loadWithDelay };
};

export const useArticleInput = (
  onArticleLoaded: (article: Article) => void
) => {
  const [mode, setMode] = useState<ArticleInputMode>("url");
  const [url, setUrl] = useState<string>("");
  const [textState, setTextState] = useState<RawTextInput>(DEFAULT_TEXT_STATE);
  const { isLoading, error, setError, loadWithDelay } =
    useDelayedArticleLoad(onArticleLoaded);

  const handleSelectPreset = useCallback((presetId: string) => {
    const found = SAMPLE_ARTICLES.find((a) => a.id === presetId);
    if (!found) return;
    setError(null);
    onArticleLoaded(found);
  }, [onArticleLoaded, setError]);

  const handleFetchUrl = useCallback((targetUrl: string) => {
    if (!targetUrl.trim()) {
      setError("Please enter a valid article URL.");
      return;
    }
    loadWithDelay(URL_FETCH_DELAY_MS, () => createFallbackUrlArticle(targetUrl));
  }, [loadWithDelay, setError]);

  const handleParsePastedText = useCallback(() => {
    if (!textState.title.trim() && !textState.content.trim()) {
      setError("Please provide a title and article text.");
      return;
    }
    loadWithDelay(TEXT_PARSE_DELAY_MS, () => parseRawTextToArticle(textState));
  }, [textState, loadWithDelay, setError]);

  const loadSamplePastedText = useCallback(() => {
    setTextState(SAMPLE_TEXT_STATE);
  }, []);

  return {
    mode,
    setMode,
    url,
    setUrl,
    textState,
    setTextState,
    isLoading,
    error,
    handleSelectPreset,
    handleFetchUrl,
    handleParsePastedText,
    loadSamplePastedText,
  };
};
