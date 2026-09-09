import { X } from "lucide-react";
import * as React from "react";

import { TextInputTab, TextInputTabProps } from "./TextInputTab";

import { Button } from "@/components/ui/Button";

export interface ArticleInputModalProps {
  isOpen: boolean;
  onClose?: () => void;
  canClose: boolean;
  textTab: TextInputTabProps;
}

export const ArticleInputModal: React.FC<ArticleInputModalProps> = ({
  isOpen,
  onClose,
  canClose,
  textTab,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
      <div className="relative w-full max-w-xl rounded-xl border border-zinc-200 bg-white p-6 shadow-xl">
        <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
          <h2 className="text-base font-bold font-serif text-black">Add an article</h2>
          {canClose && onClose && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-7 w-7 text-zinc-400 hover:text-black"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        <div className="pt-4">
          <TextInputTab {...textTab} />
        </div>
      </div>
    </div>
  );
};
