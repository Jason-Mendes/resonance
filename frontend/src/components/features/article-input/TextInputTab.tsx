import * as React from "react";
import { ArrowRight, Loader2, FileEdit } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { RawTextInput } from "@/lib/article-parser";

export interface TextInputTabProps {
  state: RawTextInput;
  onChange: (field: keyof RawTextInput, value: string) => void;
  onSubmit: () => void;
  onLoadSample: () => void;
  isLoading: boolean;
  error?: string | null;
}

export const TextInputTab: React.FC<TextInputTabProps> = ({
  state,
  onChange,
  onSubmit,
  onLoadSample,
  isLoading,
  error,
}) => {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs text-zinc-500">
          Paste manuscript text. Use ## for headings, &gt; for quotes.
        </span>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onLoadSample}
          className="text-xs h-7 border-zinc-200 text-black hover:bg-zinc-50"
        >
          Sample
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        <div>
          <label className="block text-[11px] font-mono uppercase tracking-wider text-zinc-500 mb-1">
            Title *
          </label>
          <Input
            placeholder="Headline"
            value={state.title}
            onChange={(e) => onChange("title", e.target.value)}
            className="text-xs h-8 border-zinc-200"
          />
        </div>
        <div>
          <label className="block text-[11px] font-mono uppercase tracking-wider text-zinc-500 mb-1">
            Author
          </label>
          <Input
            placeholder="Author name"
            value={state.authorName}
            onChange={(e) => onChange("authorName", e.target.value)}
            className="text-xs h-8 border-zinc-200"
          />
        </div>
      </div>

      <div>
        <label className="block text-[11px] font-mono uppercase tracking-wider text-zinc-500 mb-1">
          Subtitle
        </label>
        <Input
          placeholder="Brief summary"
          value={state.subtitle}
          onChange={(e) => onChange("subtitle", e.target.value)}
          className="text-xs h-8 border-zinc-200"
        />
      </div>

      <div>
        <label className="block text-[11px] font-mono uppercase tracking-wider text-zinc-500 mb-1">
          Body Text *
        </label>
        <Textarea
          placeholder="Article content..."
          value={state.content}
          onChange={(e) => onChange("content", e.target.value)}
          className="min-h-[140px] text-xs font-sans leading-relaxed border-zinc-200"
          error={error || undefined}
        />
      </div>

      <div className="flex justify-end pt-1">
        <Button
          type="button"
          onClick={onSubmit}
          disabled={isLoading}
          className="gap-1.5 bg-black text-white hover:bg-zinc-800 px-5 h-9 text-xs"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              <span>Processing...</span>
            </>
          ) : (
            <>
              <FileEdit className="h-3.5 w-3.5" />
              <span>Load Article</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
};
