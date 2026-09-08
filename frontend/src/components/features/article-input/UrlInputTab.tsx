import * as React from "react";
import { Link2, ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export interface UrlInputTabProps {
  url: string;
  onChangeUrl: (val: string) => void;
  onSubmitUrl: (url: string) => void;
  onSelectPreset: (presetId: string) => void;
  isLoading: boolean;
  error?: string | null;
}

export const UrlInputTab: React.FC<UrlInputTabProps> = ({
  url,
  onChangeUrl,
  onSubmitUrl,
  isLoading,
  error,
}) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmitUrl(url);
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="space-y-3">
        <label className="block text-xs font-mono uppercase tracking-wider text-zinc-500">
          Article URL
        </label>
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Link2 className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
            <Input
              type="url"
              placeholder="https://..."
              value={url}
              onChange={(e) => onChangeUrl(e.target.value)}
              className="pl-10 text-sm h-10 border-zinc-200"
              error={error || undefined}
            />
          </div>
          <Button
            type="submit"
            disabled={isLoading}
            className="h-10 px-5 gap-1.5 bg-black hover:bg-zinc-800 text-white text-xs"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                <span>Pulling...</span>
              </>
            ) : (
              <>
                <span>Pull Article</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};
