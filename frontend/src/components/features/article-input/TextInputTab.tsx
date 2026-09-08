import * as React from "react";
import { FileEdit } from "lucide-react";
import { ActionButton } from "@/components/ui/ActionButton";
import { Button } from "@/components/ui/Button";
import { RawTextInput } from "@/lib/article-parser";
import { TextInputFields } from "./TextInputFields";

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
}) => (
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

    <TextInputFields state={state} onChange={onChange} error={error} />

    <div className="flex justify-end pt-1">
      <ActionButton
        label="Load Article"
        loadingLabel="Processing..."
        isLoading={isLoading}
        onClick={onSubmit}
        icon={<FileEdit className="h-3.5 w-3.5" />}
        className="gap-1.5 bg-black text-white hover:bg-zinc-800 px-5 h-9 text-xs"
      />
    </div>
  </div>
);
