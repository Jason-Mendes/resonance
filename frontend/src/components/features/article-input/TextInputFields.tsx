import * as React from "react";

import { FormField } from "@/components/ui/FormField";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { ArticleDraft } from "@/types/article";

export interface TextInputFieldsProps {
  state: ArticleDraft;
  onChange: (field: keyof ArticleDraft, value: string) => void;
  error?: string | null;
}

interface DraftFieldProps extends TextInputFieldsProps {
  label: string;
  placeholder: string;
  field: keyof ArticleDraft;
}

/** One single-line field of the draft. Five of the six inputs are this. */
const DraftField: React.FC<DraftFieldProps> = ({ label, placeholder, field, state, onChange }) => (
  <FormField label={label}>
    <Input
      placeholder={placeholder}
      value={state[field] ?? ""}
      onChange={(e) => onChange(field, e.target.value)}
      className="text-xs h-8 border-zinc-200"
    />
  </FormField>
);

export const TextInputFields: React.FC<TextInputFieldsProps> = ({ state, onChange, error }) => {
  const field = { state, onChange };

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        <DraftField {...field} label="Title *" placeholder="Headline" field="title" />
        <DraftField {...field} label="Author" placeholder="Author name" field="authorName" />
      </div>

      <DraftField {...field} label="Subtitle" placeholder="Brief summary" field="subtitle" />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        <DraftField {...field} label="Section" placeholder="Schweiz, Wirtschaft" field="kicker" />
        <DraftField {...field} label="Image URL" placeholder="https://..." field="heroImageUrl" />
      </div>

      <FormField label="Body Text *">
        <Textarea
          placeholder="Article content..."
          value={state.body}
          onChange={(e) => onChange("body", e.target.value)}
          className="min-h-[140px] text-xs font-sans leading-relaxed border-zinc-200"
          error={error || undefined}
        />
      </FormField>
    </>
  );
};
