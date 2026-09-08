import { ArrowLeft } from "lucide-react";
import * as React from "react";

import { Button } from "@/components/ui/Button";
import { Article } from "@/types/article";

export interface AppHeaderProps {
  article: Article | null;
  onBackToList?: () => void;
  onOpenInput?: () => void;
}

export const AppHeader: React.FC<AppHeaderProps> = ({ article, onBackToList }) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-zinc-200 bg-white">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Left: Brand & Back to Articles */}
        <div className="flex items-center space-x-3">
          {article && onBackToList && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onBackToList}
              className="gap-1.5 text-xs text-zinc-600 hover:text-black px-2 -ml-2 rounded-none"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Articles</span>
            </Button>
          )}

          <div className="flex items-center space-x-2">
            <span className="font-serif text-base font-bold tracking-tight text-black">
              RESONANCE
            </span>
          </div>

          {article && (
            <span className="hidden md:inline-block text-xs text-zinc-400 truncate max-w-xs pl-3 border-l border-zinc-200">
              {article.title}
            </span>
          )}
        </div>
      </div>
    </header>
  );
};
