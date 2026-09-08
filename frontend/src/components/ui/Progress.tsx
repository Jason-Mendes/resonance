import * as React from "react";
import { cn } from "@/lib/utils";

export interface ProgressProps {
  value: number;
  className?: string;
  indicatorClassName?: string;
}

export const Progress: React.FC<ProgressProps> = ({
  value,
  className,
  indicatorClassName,
}) => {
  const clampedValue = Math.min(100, Math.max(0, value));

  return (
    <div
      className={cn(
        "relative h-1.5 w-full overflow-hidden rounded-none bg-zinc-100",
        className
      )}
    >
      <div
        className={cn(
          "h-full w-full flex-1 bg-black transition-all duration-300 ease-in-out",
          indicatorClassName
        )}
        style={{ transform: `translateX(-${100 - clampedValue}%)` }}
      />
    </div>
  );
};
