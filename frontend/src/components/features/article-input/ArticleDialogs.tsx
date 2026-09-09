import * as React from "react";

import { AddArticleDialog } from "./AddArticleDialog";
import { EditArticleDialog } from "./EditArticleDialog";

import { Article } from "@/types/article";

export interface ArticleDialogsProps {
  isAddOpen: boolean;
  isEditOpen: boolean;
  /** The article being edited. Null on the list, where there is nothing to edit. */
  article: Article | null;
  onCloseAdd: () => void;
  onCloseEdit: () => void;
  onAdded: (article: Article) => void;
  onEdited: () => void;
}

/** Both ways an article reaches the database, kept together so the page holds
 *  the flags and this holds the wiring. */
export const ArticleDialogs: React.FC<ArticleDialogsProps> = ({
  isAddOpen,
  isEditOpen,
  article,
  onCloseAdd,
  onCloseEdit,
  onAdded,
  onEdited,
}) => (
  <>
    <AddArticleDialog isOpen={isAddOpen} onClose={onCloseAdd} onSaved={onAdded} />

    {/* Mounted only while editing, so closing discards the draft and the form
        is reseeded from the stored article on the next open. */}
    {isEditOpen && article && (
      <EditArticleDialog article={article} onClose={onCloseEdit} onSaved={onEdited} />
    )}
  </>
);
