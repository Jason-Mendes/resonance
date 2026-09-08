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
        <aside className="lg:col-span-5 xl:col-span-5 min-w-0 sticky top-20">
          <div className="bg-white rounded-none border border-zinc-200 p-5">{childrenRight}</div>
        </aside>
      </div>
    </div>
  );
};
