import * as React from "react";

import { ArticleInputModal } from "./ArticleInputModal";

import { useArticleEdit } from "@/hooks/useArticleEdit";
import { Article } from "@/types/article";

export interface EditArticleDialogProps {
  article: Article;
  onClose: () => void;
  onSaved: (article: Article) => void;
}

/**
 * The add dialog's counterpart: the same form, seeded from a stored article
 * and saved back over it.
 *
 * There is no isOpen prop because the page mounts this only while an article
 * is being edited. Closing therefore unmounts it and the draft goes with it,
 * so reopening starts from the stored article rather than from abandoned text
 * an editor has long forgotten typing.
 */
export const EditArticleDialog: React.FC<EditArticleDialogProps> = ({
  article,
  onClose,
  onSaved,
}) => {
  const { draft, updateField, submit, isSaving, error, losses } = useArticleEdit(article, onSaved);

  return (
    <ArticleInputModal
      isOpen
      onClose={onClose}
      canClose
      heading="Edit article"
      textTab={{
        state: draft,
        onChange: updateField,
        onSubmit: submit,
        isLoading: isSaving,
        error,
        submitLabel: "Save changes",
        notice: losses,
      }}
    />
  );
};
