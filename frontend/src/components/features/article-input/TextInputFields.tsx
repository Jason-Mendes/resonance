import * as React from "react";

import { FormField } from "@/components/ui/FormField";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { RawTextInput } from "@/lib/article-parser";

export interface TextInputFieldsProps {
  state: RawTextInput;
  onChange: (field: keyof RawTextInput, value: string) => void;
  error?: string | null;
}

export const TextInputFields: React.FC<TextInputFieldsProps> = ({ state, onChange, error }) => (
  <>
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
      <FormField label="Title *">
        <Input
          placeholder="Headline"
          value={state.title}
          onChange={(e) => onChange("title", e.target.value)}
          className="text-xs h-8 border-zinc-200"
        />
      </FormField>
      <FormField label="Author">
        <Input
          placeholder="Author name"
          value={state.authorName}
          onChange={(e) => onChange("authorName", e.target.value)}
          className="text-xs h-8 border-zinc-200"
        />
      </FormField>
    </div>

    <FormField label="Subtitle">
      <Input
        placeholder="Brief summary"
        value={state.subtitle}
        onChange={(e) => onChange("subtitle", e.target.value)}
        className="text-xs h-8 border-zinc-200"
      />
    </FormField>

    <FormField label="Body Text *">
      <Textarea
        placeholder="Article content..."
        value={state.content}
        onChange={(e) => onChange("content", e.target.value)}
        className="min-h-[140px] text-xs font-sans leading-relaxed border-zinc-200"
        error={error || undefined}
      />
    </FormField>
  </>
);
