import * as React from "react";

import { cn } from "@/lib/utils";

export interface StudioLayoutProps {
  childrenLeft: React.ReactNode;
  childrenRight: React.ReactNode;
  className?: string;
}

export const StudioLayout: React.FC<StudioLayoutProps> = ({
  childrenLeft,
  childrenRight,
  className,
}) => {
  return (
    <div className={cn("mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6", className)}>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Formatted Article */}
        <main className="lg:col-span-7 xl:col-span-7 min-w-0">
          <div className="bg-white rounded-none border border-zinc-200 p-6 sm:p-8">
            {childrenLeft}
          </div>
        </main>

        {/* Right Column: Audio Dialogue Generation */}
        {/* Pinned and independently scrollable: the studio is a control panel
            for the article beside it, so it must stay usable while the reader
            scrolls the story. The height bound is what makes it scroll rather
            than overflow past the viewport. */}
        <aside className="lg:col-span-5 xl:col-span-5 min-w-0 lg:sticky lg:top-20 lg:max-h-[calc(100vh-6rem)] lg:overflow-y-auto">
          <div className="bg-white rounded-none border border-zinc-200 p-5">{childrenRight}</div>
        </aside>
      </div>
    </div>
  );
};
