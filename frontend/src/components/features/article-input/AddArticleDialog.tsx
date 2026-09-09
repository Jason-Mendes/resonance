import * as React from "react";

import { ArticleInputModal } from "./ArticleInputModal";

import { useArticleInput } from "@/hooks/useArticleInput";
import { Article } from "@/types/article";

export interface AddArticleDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: (article: Article) => void;
}

/**
 * Owns the draft state so the page does not have to. The page decides when
 * the dialog is open and what happens after a save; everything between those
 * two points lives here.
 */
export const AddArticleDialog: React.FC<AddArticleDialogProps> = ({ isOpen, onClose, onSaved }) => {
  const { draft, updateField, submit, isSaving, error } = useArticleInput(onSaved);

  return (
    <ArticleInputModal
      isOpen={isOpen}
      onClose={onClose}
      canClose
      heading="Add an article"
      textTab={{
        state: draft,
        onChange: updateField,
        onSubmit: submit,
        isLoading: isSaving,
        error,
      }}
    />
  );
};
