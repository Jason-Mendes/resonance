import { Link, FileText, X } from "lucide-react";
import * as React from "react";

import { TextInputTab, TextInputTabProps } from "./TextInputTab";
import { UrlInputTab, UrlInputTabProps } from "./UrlInputTab";

import { Button } from "@/components/ui/Button";
import { Tabs, TabItem } from "@/components/ui/Tabs";
import { ArticleInputMode } from "@/types/article";

export interface ArticleInputModalProps {
  isOpen: boolean;
  onClose?: () => void;
  canClose: boolean;
  mode: ArticleInputMode;
  onChangeMode: (mode: ArticleInputMode) => void;
  urlTab: UrlInputTabProps;
  textTab: TextInputTabProps;
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
  urlTab,
  textTab,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
      <div className="relative w-full max-w-xl rounded-xl border border-zinc-200 bg-white p-6 shadow-xl">
        <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
          <h2 className="text-base font-bold font-serif text-black">Import Article</h2>
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

        <div className="py-3">
          <Tabs
            items={TABS}
            activeId={mode}
            onChange={(id) => onChangeMode(id as ArticleInputMode)}
          />
        </div>

        <div className="mt-1">
          {mode === "url" ? <UrlInputTab {...urlTab} /> : <TextInputTab {...textTab} />}
        </div>
      </div>
    </div>
  );
};
