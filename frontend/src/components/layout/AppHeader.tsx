import { ArrowLeft, Pencil } from "lucide-react";
import Image from "next/image";
import * as React from "react";

import googleCloudLogo from "@/assets/logo_googleCloud.png";
import nzzLogo from "@/assets/nzz-black.svg";
import { Button } from "@/components/ui/Button";
import { Article } from "@/types/article";

export interface AppHeaderProps {
  article: Article | null;
  onBackToList?: () => void;
  /** Opens the edit form for the article on screen. Absent on the list. */
  onEditArticle?: () => void;
}

const BackToArticles: React.FC<{ onBackToList: () => void }> = ({ onBackToList }) => (
  <Button
    variant="ghost"
    size="sm"
    onClick={onBackToList}
    className="gap-1.5 text-xs text-zinc-600 hover:text-black px-2 -ml-2 rounded-none"
  >
    <ArrowLeft className="h-3.5 w-3.5" />
    <span>Articles</span>
  </Button>
);

const Masthead: React.FC = () => (
  <div className="flex items-center space-x-3">
    <Image src={nzzLogo} alt="NZZ" className="h-5 w-auto" priority />
    <span className="font-serif text-base font-bold tracking-tight text-black border-l border-zinc-200 pl-3">
      RESONANCE
    </span>
  </div>
);

/**
 * The studio generates from whatever is stored, so a correction made here is
 * what the next podcast, summary and set of key points are built from.
 */
const EditArticleButton: React.FC<{ onEditArticle: () => void }> = ({ onEditArticle }) => (
  <Button
    variant="outline"
    size="sm"
    onClick={onEditArticle}
    className="gap-1.5 rounded-none border-zinc-300 px-3 text-xs text-zinc-700 hover:text-black"
  >
    <Pencil className="h-3.5 w-3.5" />
    <span>Edit article</span>
  </Button>
);

const PoweredBy: React.FC = () => (
  <div className="flex items-center gap-2">
    <span className="text-[11px] font-mono text-black font-medium uppercase tracking-wider shrink-0">
      Powered by
    </span>
    <Image
      src={googleCloudLogo}
      alt="Google Cloud"
      className="h-4 sm:h-4.5 w-auto object-contain"
      priority
    />
  </div>
);

export const AppHeader: React.FC<AppHeaderProps> = ({ article, onBackToList, onEditArticle }) => (
  <header className="sticky top-0 z-40 w-full border-b border-zinc-200 bg-white">
    <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
      <div className="flex items-center space-x-3">
        {article && onBackToList && <BackToArticles onBackToList={onBackToList} />}
        <Masthead />
        {article && (
          <span className="hidden md:inline-block text-xs text-zinc-400 truncate max-w-xs pl-3 border-l border-zinc-200">
            {article.title}
          </span>
        )}
      </div>

      <div className="flex items-center gap-3">
        {article && onEditArticle && <EditArticleButton onEditArticle={onEditArticle} />}
        <PoweredBy />
      </div>
    </div>
  </header>
);
