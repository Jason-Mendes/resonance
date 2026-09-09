import { FileEdit } from "lucide-react";
import * as React from "react";

import { TextInputFields } from "./TextInputFields";

import { ActionButton } from "@/components/ui/ActionButton";
import { ArticleDraft } from "@/types/article";

export interface TextInputTabProps {
  state: ArticleDraft;
  onChange: (field: keyof ArticleDraft, value: string) => void;
  onSubmit: () => void;
  isLoading: boolean;
  error?: string | null;
}

export const TextInputTab: React.FC<TextInputTabProps> = ({
  state,
  onChange,
  onSubmit,
  isLoading,
  error,
}) => {
  // A headline and a body are what the backend requires, so the button stays
  // out of reach until both are there rather than failing a round trip.
  const canSubmit = state.title.trim().length > 0 && state.body.trim().length > 0;

  return (
    <div className="space-y-3">
      <span className="block text-xs text-zinc-500">
        Paste the article text. Use ## for a heading and &gt; for a pulled quote. The first
        paragraph becomes the standfirst.
      </span>

      <TextInputFields state={state} onChange={onChange} error={error} />

      <div className="flex justify-end pt-1">
        <ActionButton
          label="Save Article"
          loadingLabel="Saving..."
          isLoading={isLoading}
          disabled={!canSubmit}
          onClick={onSubmit}
          icon={<FileEdit className="h-3.5 w-3.5" />}
          className="gap-1.5 bg-black text-white hover:bg-zinc-800 px-5 h-9 text-xs disabled:opacity-40"
        />
      </div>
    </div>
  );
};
