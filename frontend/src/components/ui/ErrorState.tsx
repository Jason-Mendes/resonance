import * as React from "react";
import { Button } from "./Button";

export interface ErrorStateProps {
  message: string;
  onRetry?: () => void;
  retryLabel?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  message,
  onRetry,
  retryLabel = "Retry",
}) => (
  <div className="text-center py-16 space-y-3">
    <p className="text-xs text-red-600">{message}</p>
    {onRetry && (
      <Button
        variant="outline"
        size="sm"
        onClick={onRetry}
        className="rounded-none border-zinc-200"
      >
        {retryLabel}
      </Button>
    )}
  </div>
);
