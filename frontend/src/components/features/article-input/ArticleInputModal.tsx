import * as React from "react";
import { Link, FileText, X } from "lucide-react";
import { Tabs, TabItem } from "@/components/ui/Tabs";
import { Button } from "@/components/ui/Button";
import { ArticleInputMode } from "@/types/article";
import { RawTextInput } from "@/lib/article-parser";
import { UrlInputTab } from "./UrlInputTab";
import { TextInputTab } from "./TextInputTab";

export interface ArticleInputModalProps {
  isOpen: boolean;
  onClose?: () => void;
  canClose: boolean;
  mode: ArticleInputMode;
  onChangeMode: (mode: ArticleInputMode) => void;
  url: string;
  onChangeUrl: (url: string) => void;
  onSubmitUrl: (url: string) => void;
  onSelectPreset: (presetId: string) => void;
  textState: RawTextInput;
  onChangeTextState: (field: keyof RawTextInput, value: string) => void;
  onSubmitText: () => void;
  onLoadSampleText: () => void;
  isLoading: boolean;
  error?: string | null;
}

const TABS: TabItem[] = [
  { id: "url", label: "URL", icon: <Link className="h-3.5 w-3.5" /> },
  { id: "text", label: "Paste Text", icon: <FileText className="h-3.5 w-3.5" /> },
];

export const ArticleInputModal: React.FC<ArticleInputModalProps> = ({
  isOpen,
  onClose,
  canClose,
  mode,
  onChangeMode,
  url,
  onChangeUrl,
  onSubmitUrl,
  onSelectPreset,
  textState,
  onChangeTextState,
  onSubmitText,
  onLoadSampleText,
  isLoading,
  error,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
      <div className="relative w-full max-w-xl rounded-xl border border-zinc-200 bg-white p-6 shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
          <h2 className="text-base font-bold font-serif text-black">
            Import Article
          </h2>
          {canClose && onClose && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-7 w-7 text-zinc-400 hover:text-black"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Tab Selector */}
        <div className="py-3">
          <Tabs
            items={TABS}
            activeId={mode}
            onChange={(id) => onChangeMode(id as ArticleInputMode)}
          />
        </div>

        {/* Content Body */}
        <div className="mt-1">
          {mode === "url" ? (
            <UrlInputTab
              url={url}
              onChangeUrl={onChangeUrl}
              onSubmitUrl={onSubmitUrl}
              onSelectPreset={onSelectPreset}
              isLoading={isLoading}
              error={error}
            />
          ) : (
            <TextInputTab
              state={textState}
              onChange={onChangeTextState}
              onSubmit={onSubmitText}
              onLoadSample={onLoadSampleText}
              isLoading={isLoading}
              error={error}
            />
          )}
        </div>
      </div>
    </div>
  );
};
