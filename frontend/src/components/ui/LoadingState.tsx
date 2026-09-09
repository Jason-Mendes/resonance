import { Loader2 } from "lucide-react";
import * as React from "react";

export interface LoadingStateProps {
  message: string;
}

/** ErrorState's counterpart: the same centred block while something is in flight. */
export const LoadingState: React.FC<LoadingStateProps> = ({ message }) => (
  <div className="flex flex-col items-center justify-center py-32 space-y-3">
    <Loader2 className="h-6 w-6 animate-spin text-black" />
    <span className="text-xs font-mono text-zinc-500">{message}</span>
  </div>
);
